const DEFAULT_MODEL = "@cf/deepgram/aura-2-en";
const DEFAULT_VOICE = "athena";
const DEFAULT_FORMAT = "mp3";
const DEFAULT_VOICES = [
  "athena",
  "luna",
  "orion",
  "asteria",
  "hera",
  "apollo",
  "iris",
  "ariel",
];
const DEFAULT_ALLOWED_ORIGINS = [
  "https://martinlepage26-bit.github.io",
  "https://martin-lepage-site.pages.dev",
  "https://*.martin-lepage-site.pages.dev",
];

const VOICE_ALIASES = {
  ariel: "athena",
  "ariel-en": "athena",
  voice11: "athena",
};

function parseCsv(raw) {
  return String(raw || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseVoices(env) {
  const configured = parseCsv(env.ECHO_TTS_VOICES);
  return configured.length ? configured : DEFAULT_VOICES;
}

function parseAllowedOrigins(env) {
  const configured = parseCsv(env.ECHO_TTS_ALLOWED_ORIGINS);
  return configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
}

function originMatches(origin, pattern) {
  if (pattern === "*") {
    return true;
  }
  if (!pattern.includes("*")) {
    return origin === pattern;
  }
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  const matcher = new RegExp(`^${escaped}$`);
  return matcher.test(origin);
}

function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) {
    return false;
  }
  return allowedOrigins.some((pattern) => originMatches(origin, pattern));
}

function normalizeRate(rawRate) {
  const numeric = Number.parseInt(String(rawRate ?? "0"), 10);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.max(-75, Math.min(75, numeric));
}

function rateToSpeed(rate) {
  const speed = 1 + rate / 100;
  return Math.max(0.5, Math.min(2, Number(speed.toFixed(2))));
}

function normalizeVoice(rawVoice, voiceCatalog) {
  const candidate = String(rawVoice || DEFAULT_VOICE).trim();
  if (!candidate) {
    return DEFAULT_VOICE;
  }

  const mapped = VOICE_ALIASES[candidate.toLowerCase()] || candidate;
  const exact = voiceCatalog.find((voice) => voice.toLowerCase() === mapped.toLowerCase());
  return exact || DEFAULT_VOICE;
}

function safeFilename(name) {
  const cleaned = String(name || "echo-output")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = cleaned || "echo-output";
  return base.toLowerCase().endsWith(".mp3") ? base : `${base}.mp3`;
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(payload, status, origin) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function decodeBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toAudioBody(result) {
  if (result instanceof ReadableStream) {
    return { body: result, contentType: "audio/mpeg" };
  }

  if (result instanceof ArrayBuffer) {
    return { body: result, contentType: "audio/mpeg" };
  }

  if (ArrayBuffer.isView(result)) {
    return { body: result, contentType: "audio/mpeg" };
  }

  if (result && typeof result.audio === "string") {
    return { body: decodeBase64(result.audio), contentType: "audio/wav" };
  }

  if (result && result.audio instanceof ArrayBuffer) {
    return { body: result.audio, contentType: "audio/mpeg" };
  }

  if (result && ArrayBuffer.isView(result.audio)) {
    return { body: result.audio, contentType: "audio/mpeg" };
  }

  throw new Error("Unknown audio payload shape from AI model.");
}

function buildModelInput(model, text, voice, speed) {
  if (model.includes("@cf/myshell-ai/melotts")) {
    return {
      prompt: text,
      speaker: voice,
      speed,
    };
  }

  return {
    text,
    speaker: voice,
    speed,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = parseAllowedOrigins(env);
    const originAllowed = isOriginAllowed(origin, allowedOrigins);
    const responseOrigin = originAllowed ? origin : "*";
    const voiceCatalog = parseVoices(env);
    const model = (env.ECHO_TTS_MODEL || DEFAULT_MODEL).trim();
    const format = (env.ECHO_TTS_FORMAT || DEFAULT_FORMAT).trim().toLowerCase();

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(responseOrigin),
      });
    }

    if (request.method === "GET" && (path === "/" || path === "/health" || path === "/api/echo-tts")) {
      return jsonResponse(
        {
          ok: true,
          mode: "online-only",
          backend: "Cloudflare Workers AI",
          defaults: {
            model,
            voice: DEFAULT_VOICE,
            format,
            voices: voiceCatalog,
          },
        },
        200,
        responseOrigin,
      );
    }

    if (request.method !== "POST" || (path !== "/" && path !== "/api/echo-tts")) {
      return jsonResponse({ ok: false, error: "Not found." }, 404, responseOrigin);
    }

    if (!originAllowed) {
      return jsonResponse({ ok: false, error: "Origin is not allowed for this endpoint." }, 403, responseOrigin);
    }

    let body;
    try {
      body = await request.json();
    } catch (_error) {
      return jsonResponse({ ok: false, error: "Request body must be valid JSON." }, 400, responseOrigin);
    }

    const text = String(body.text || "").trim();
    if (!text) {
      return jsonResponse({ ok: false, error: "`text` is required." }, 400, responseOrigin);
    }
    if (text.length > 4000) {
      return jsonResponse({ ok: false, error: "`text` exceeds 4000 characters." }, 400, responseOrigin);
    }

    const rate = normalizeRate(body.rate);
    const speed = rateToSpeed(rate);
    const voice = normalizeVoice(body.voiceId || body.voice, voiceCatalog);
    const filename = safeFilename(body.filename);
    const modelInput = buildModelInput(model, text, voice, speed);

    let audioResult;
    try {
      audioResult = await env.AI.run(model, modelInput);
    } catch (error) {
      return jsonResponse(
        {
          ok: false,
          error: "Upstream synthesis request failed.",
          details: String(error?.message || error).slice(0, 400),
        },
        502,
        responseOrigin,
      );
    }

    let audio;
    try {
      audio = toAudioBody(audioResult);
    } catch (error) {
      return jsonResponse(
        {
          ok: false,
          error: "Synthesis returned an unexpected payload.",
          details: String(error?.message || error),
        },
        502,
        responseOrigin,
      );
    }

    return new Response(audio.body, {
      status: 200,
      headers: {
        ...corsHeaders(responseOrigin),
        "Content-Type": audio.contentType || "audio/mpeg",
        "Content-Disposition": `inline; filename="${filename}"`,
        "X-Echo-Backend": "Cloudflare Workers AI",
        "X-Echo-Model": model,
        "X-Echo-Voice": voice,
        "X-Echo-Speed": String(speed),
      },
    });
  },
};
