const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
export const API_BASE = `${BASE}/api`;

export type Voice = { id: string; name: string; tag: string };
export type WordTiming = { word: string; start: number; end: number; index: number };
export type TTSResponse = {
  audio_base64: string;
  mime: string;
  voice_id: string;
  word_count: number;
  char_count: number;
  words: WordTiming[];
  estimated_duration: number;
};
export type STTResponse = {
  id: string;
  transcript: string;
  created_at: string;
  duration?: number | null;
};
export type ParseFileResponse = {
  text: string;
  filename: string;
  word_count: number;
  char_count: number;
};

async function jfetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      detail = j?.detail || detail;
    } catch {}
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  return (await res.json()) as T;
}

export const api = {
  getVoices: () => jfetch<{ voices: Voice[]; default: string }>('/voices'),
  getSampleText: () => jfetch<{ text: string }>('/sample-text'),

  generateTTS: (text: string, voice_id: string, speed: number = 1.0) =>
    jfetch<TTSResponse>('/tts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_id, speed }),
    }),

  transcribe: async (uri: string, filename: string, mime: string) => {
    const form = new FormData();
    // @ts-ignore — React Native FormData file shape
    form.append('audio', { uri, name: filename, type: mime });
    const res = await fetch(`${API_BASE}/stt/transcribe`, { method: 'POST', body: form });
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        detail = j?.detail || detail;
      } catch {}
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    return (await res.json()) as STTResponse;
  },

  parseFile: async (uri: string, filename: string, mime: string) => {
    const form = new FormData();
    // @ts-ignore
    form.append('file', { uri, name: filename, type: mime });
    const res = await fetch(`${API_BASE}/parse-file`, { method: 'POST', body: form });
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        detail = j?.detail || detail;
      } catch {}
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    return (await res.json()) as ParseFileResponse;
  },
};
