const DEFAULT_MODEL = "gpt-4o-mini-tts";
const DEFAULT_VOICE = "alloy";
const DEFAULT_FORMAT = "mp3";
const DEFAULT_VOICES = ["alloy", "echo", "sage"];

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function parseVoices(env) {
  const raw = (env.ECHO_TTS_VOICES || "").trim();
  if (!raw) {
    return DEFAULT_VOICES;
  }
  const voices = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return voices.length ? voices : DEFAULT_VOICES;
}

function defaultConfig(env) {
  return {
    model: (env.ECHO_TTS_MODEL || DEFAULT_MODEL).trim(),
    voice: (env.ECHO_TTS_DEFAULT_VOICE || DEFAULT_VOICE).trim(),
    format: (env.ECHO_TTS_FORMAT || DEFAULT_FORMAT).trim().toLowerCase(),
    voices: parseVoices(env),
  };
}

function providerBase(env) {
  return (env.ECHO_TTS_API_BASE || "https://api.openai.com/v1").replace(/\/+$/, "");
}

function providerPath(env) {
  const path = (env.ECHO_TTS_API_PATH || "/audio/speech").trim();
  return path.startsWith("/") ? path : `/${path}`;
}

function allowedOrigins(request, env) {
  const configured = (env.ECHO_TTS_ALLOWED_ORIGINS || "").trim();
  if (!configured) {
    return [new URL(request.url).origin];
  }
  return configured
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isOriginAllowed(request, env) {
  const requestOrigin = request.headers.get("Origin");
  if (!requestOrigin) {
    return false;
  }
  const allowed = allowedOrigins(request, env);
  return allowed.includes(requestOrigin);
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
  return Math.max(0.25, Math.min(4, Number(speed.toFixed(2))));
}

function safeFilename(name) {
  const cleaned = String(name || "echo-output")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = cleaned || "echo-output";
  return base.toLowerCase().endsWith(".mp3") ? base : `${base}.mp3`;
}

async function callProvider(env, payload) {
  const apiKey = env.OPENAI_API_KEY || env.ECHO_TTS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      response: jsonResponse(
        {
          ok: false,
          error: "Missing OPENAI_API_KEY (or ECHO_TTS_API_KEY) in runtime environment.",
        },
        500,
      ),
    };
  }

  const url = `${providerBase(env)}${providerPath(env)}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const firstAttempt = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (firstAttempt.ok) {
    return { ok: true, response: firstAttempt };
  }

  const firstErrorBody = await firstAttempt.text();
  const shouldRetryWithResponseFormat = /response_format|format|unknown/i.test(firstErrorBody);

  if (!shouldRetryWithResponseFormat) {
    return {
      ok: false,
      response: jsonResponse(
        {
          ok: false,
          error: "Upstream synthesis request failed.",
          status: firstAttempt.status,
          details: firstErrorBody.slice(0, 600),
        },
        502,
      ),
    };
  }

  const retryPayload = { ...payload };
  delete retryPayload.format;
  retryPayload.response_format = payload.format || DEFAULT_FORMAT;

  const secondAttempt = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(retryPayload),
  });

  if (secondAttempt.ok) {
    return { ok: true, response: secondAttempt };
  }

  const secondErrorBody = await secondAttempt.text();
  return {
    ok: false,
    response: jsonResponse(
      {
        ok: false,
        error: "Upstream synthesis request failed.",
        status: secondAttempt.status,
        details: secondErrorBody.slice(0, 600),
      },
      502,
    ),
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestGet(context) {
  const defaults = defaultConfig(context.env);
  return jsonResponse({
    ok: true,
    mode: "online-only",
    backend: "OpenAI-compatible TTS",
    defaults,
  });
}

export async function onRequestPost(context) {
  if (!isOriginAllowed(context.request, context.env)) {
    return jsonResponse(
      {
        ok: false,
        error: "Origin is not allowed for this endpoint.",
      },
      403,
    );
  }

  let body;
  try {
    body = await context.request.json();
  } catch (_error) {
    return jsonResponse({ ok: false, error: "Request body must be valid JSON." }, 400);
  }

  const text = String(body.text || "").trim();
  if (!text) {
    return jsonResponse({ ok: false, error: "`text` is required." }, 400);
  }
  if (text.length > 4000) {
    return jsonResponse({ ok: false, error: "`text` exceeds 4000 characters." }, 400);
  }

  const defaults = defaultConfig(context.env);
  const rate = normalizeRate(body.rate);
  const speed = rateToSpeed(rate);
  const filename = safeFilename(body.filename);

  const payload = {
    model: String(body.model || defaults.model),
    voice: String(body.voiceId || body.voice || defaults.voice),
    input: text,
    format: defaults.format,
    speed,
  };

  if (body.instructions) {
    payload.instructions = String(body.instructions);
  }

  const upstream = await callProvider(context.env, payload);
  if (!upstream.ok) {
    return upstream.response;
  }

  const contentType = upstream.response.headers.get("content-type") || "audio/mpeg";
  return new Response(upstream.response.body, {
    status: 200,
    headers: {
      ...corsHeaders(),
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "X-Echo-Backend": "OpenAI-compatible TTS",
      "X-Echo-Model": payload.model,
      "X-Echo-Voice": payload.voice,
      "X-Echo-Speed": String(speed),
    },
  });
}
