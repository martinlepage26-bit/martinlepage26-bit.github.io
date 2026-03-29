import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

const SAMPLE_TEXT =
  'ECHO is a browser-native reading surface for listening to drafts out loud. Paste text or import a document, choose a voice profile, and hear the language back with live word tracking.';

const STORAGE_KEY = 'echo-reader-state-v1';
const VOICE_POLL_INTERVAL_MS = 700;
const VOICE_POLL_MAX_ATTEMPTS = 12;

const SUPPORTED_EXTENSIONS = new Set(['txt', 'md', 'markdown', 'docx', 'pdf']);
const TEXT_EXTENSIONS = new Set(['txt', 'md', 'markdown']);
const DOCX_EXTENSIONS = new Set(['docx']);
const PDF_EXTENSIONS = new Set(['pdf']);

const PROFILE_CATALOG = [
  {
    id: 'echo',
    label: 'ECHO',
    summary: 'Balanced default delivery for general draft review and everyday listening.',
    rate: 1,
    pitch: 1,
    volume: 1,
    langPrefixes: ['en', 'fr'],
    nameHints: ['aria', 'jenny', 'samantha', 'google', 'daniel', 'davis', 'thomas'],
  },
  {
    id: 'ariel',
    label: 'Ariel',
    summary: 'Brighter articulation and a slightly faster cadence for crisp readbacks.',
    rate: 1.08,
    pitch: 1.12,
    volume: 1,
    langPrefixes: ['en'],
    nameHints: ['aria', 'ava', 'jenny', 'samantha', 'emma', 'zira', 'hazel'],
  },
  {
    id: 'voice11',
    label: 'Voice11',
    summary: 'Lower, steadier pacing for reflective listening and slower review passes.',
    rate: 0.92,
    pitch: 0.88,
    volume: 1,
    langPrefixes: ['en', 'fr'],
    nameHints: ['guy', 'davis', 'daniel', 'thomas', 'oliver', 'ryan', 'bruce', 'david'],
  },
];

function normalizeText(raw) {
  return String(raw || '')
    .replace(/\u0000/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extensionFromFilename(filename) {
  const name = String(filename || '').trim().toLowerCase();
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1) : '';
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number.parseFloat(String(value ?? ''));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function countWords(text) {
  return normalizeText(text).split(/\s+/).filter(Boolean).length;
}

function estimateMinutes(text, rate) {
  const words = countWords(text);
  if (!words) {
    return 0;
  }
  const effectiveRate = Math.max(0.5, rate || 1);
  return words / (165 * effectiveRate);
}

function formatMinutes(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return '~0 min';
  }
  if (value < 1) {
    return '<1 min';
  }
  return `~${Math.round(value)} min`;
}

function findProfile(profileId) {
  return PROFILE_CATALOG.find((profile) => profile.id === profileId) || PROFILE_CATALOG[0];
}

function profileFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const profileId = String(params.get('profile') || '').trim().toLowerCase();
  return PROFILE_CATALOG.some((profile) => profile.id === profileId) ? profileId : '';
}

function persistQueryProfile(profileId) {
  const url = new URL(window.location.href);
  url.searchParams.set('profile', profileId);
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function loadStoredState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function storeState(payload) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage is a convenience only
  }
}

async function extractDocxText(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return normalizeText(result.value);
}

async function extractPdfText(file, reportProgress) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  }

  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data });
  const documentProxy = await loadingTask.promise;

  const pages = [];
  for (let pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) {
    const page = await documentProxy.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => (item && typeof item.str === 'string' ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      pages.push(pageText);
    }

    if (typeof reportProgress === 'function') {
      reportProgress(pageNumber, documentProxy.numPages);
    }
  }

  return normalizeText(pages.join('\n\n'));
}

async function extractTextFromFile(file, setStatus) {
  const ext = extensionFromFilename(file.name);

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error('Unsupported file type. Supported: .txt, .md, .docx, .pdf');
  }

  if (TEXT_EXTENSIONS.has(ext)) {
    return normalizeText(await file.text());
  }

  if (DOCX_EXTENSIONS.has(ext)) {
    setStatus('Extracting text from DOCX...', 'info');
    return extractDocxText(file);
  }

  if (PDF_EXTENSIONS.has(ext)) {
    setStatus('Extracting text from PDF...', 'info');
    return extractPdfText(file, (current, total) => {
      setStatus(`Extracting PDF text (page ${current}/${total})...`, 'info');
    });
  }

  throw new Error('Unsupported file type.');
}

function trimChunk(text, start, end) {
  const slice = text.slice(start, end);
  const leading = slice.match(/^\s*/)?.[0].length || 0;
  const trailing = slice.match(/\s*$/)?.[0].length || 0;
  const chunkStart = start + leading;
  const chunkEnd = Math.max(chunkStart, end - trailing);
  const chunkText = text.slice(chunkStart, chunkEnd);

  if (!chunkText) {
    return null;
  }

  return {
    text: chunkText,
    start: chunkStart,
    end: chunkEnd,
  };
}

// Chunk long reads to avoid browser speech synthesis stalls on larger drafts.
function chunkTextForPlayback(inputText, maxChars = 1800) {
  const text = normalizeText(inputText);
  if (!text) {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(text.length, start + maxChars);

    if (end < text.length) {
      const slice = text.slice(start, end);
      const candidates = [
        slice.lastIndexOf('\n\n'),
        slice.lastIndexOf('. '),
        slice.lastIndexOf('! '),
        slice.lastIndexOf('? '),
        slice.lastIndexOf('; '),
        slice.lastIndexOf(', '),
        slice.lastIndexOf(' '),
      ].filter((value) => value > maxChars * 0.55);

      if (candidates.length) {
        end = start + Math.max(...candidates) + 1;
      } else {
        const nextSpace = text.indexOf(' ', end);
        if (nextSpace > end && nextSpace - start < maxChars + 160) {
          end = nextSpace + 1;
        }
      }
    }

    const chunk = trimChunk(text, start, end);
    if (chunk) {
      chunks.push(chunk);
    }
    start = end;
  }

  return chunks;
}

function buildWaveformBars(container) {
  container.innerHTML = '';

  const barCount = 22;
  for (let index = 0; index < barCount; index += 1) {
    const bar = document.createElement('span');
    bar.className = 'echo-bar';
    bar.style.setProperty('--echo-bar-height', `${10 + Math.round(Math.sin((index / barCount) * Math.PI) * 22)}px`);
    bar.style.setProperty('--echo-bar-duration', `${(0.45 + Math.random() * 0.45).toFixed(2)}s`);
    container.append(bar);
  }
}

function setWaveformActive(container, active) {
  container.querySelectorAll('.echo-bar').forEach((bar) => {
    bar.classList.toggle('is-active', active);
  });
}

function renderWordSurface(container, text) {
  container.innerHTML = '';

  if (!text) {
    container.textContent = 'The live reading surface will mirror your text here once you start typing or import a file.';
    return [];
  }

  const fragment = document.createDocumentFragment();
  const wordRanges = [];
  const matcher = /\S+/g;
  let lastIndex = 0;
  let match;

  while ((match = matcher.exec(text))) {
    if (match.index > lastIndex) {
      fragment.append(text.slice(lastIndex, match.index));
    }

    const span = document.createElement('span');
    span.className = 'echo-word';
    span.textContent = match[0];
    fragment.append(span);

    wordRanges.push({
      start: match.index,
      end: match.index + match[0].length,
      node: span,
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    fragment.append(text.slice(lastIndex));
  }

  container.append(fragment);
  return wordRanges;
}

function findWordIndexForChar(wordRanges, charIndex) {
  let low = 0;
  let high = wordRanges.length - 1;
  let candidate = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const range = wordRanges[mid];
    if (range.start <= charIndex) {
      candidate = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (candidate < 0) {
    return -1;
  }

  if (charIndex > wordRanges[candidate].end && candidate + 1 < wordRanges.length) {
    return candidate + 1;
  }

  return candidate;
}

function chooseVoiceForProfile(availableVoices, profileId) {
  if (!availableVoices.length) {
    return null;
  }

  const profile = findProfile(profileId);
  const navigatorLanguages = Array.isArray(window.navigator.languages)
    ? window.navigator.languages.map((entry) => entry.toLowerCase())
    : [String(window.navigator.language || '').toLowerCase()];

  let bestVoice = availableVoices[0];
  let bestScore = -Infinity;

  for (const voice of availableVoices) {
    const name = String(voice.name || '').toLowerCase();
    const lang = String(voice.lang || '').toLowerCase();
    let score = 0;

    if (voice.default) score += 6;
    if (voice.localService) score += 4;
    if (profile.langPrefixes.some((prefix) => lang.startsWith(prefix))) score += 9;
    if (navigatorLanguages.some((entry) => lang.startsWith(entry.slice(0, 2)))) score += 3;

    profile.nameHints.forEach((hint, index) => {
      if (name.includes(hint)) {
        score += 14 - index;
      }
    });

    if (score > bestScore) {
      bestVoice = voice;
      bestScore = score;
    }
  }

  return bestVoice;
}

function formatVoiceMeta(voice, totalVoices) {
  if (!voice) {
    return totalVoices
      ? `${totalVoices} browser/system voices detected.`
      : 'No system voices are available yet.';
  }

  const tags = [voice.lang || 'unknown language'];
  if (voice.default) {
    tags.push('default');
  }
  if (voice.localService) {
    tags.push('local');
  }

  return `${voice.name} · ${tags.join(' · ')} · ${totalVoices} voices available on this device`;
}

function safeFileMeta(file, extractedText) {
  if (!file) {
    return 'No file selected yet.';
  }

  const ext = extensionFromFilename(file.name);
  const sizeKb = Math.max(1, Math.round(file.size / 1024));
  return `${file.name} · ${ext || 'unknown'} · ${sizeKb} KB · ${countWords(extractedText)} words`;
}

function setVoiceSelectPlaceholder(select, label) {
  select.innerHTML = '';
  const option = document.createElement('option');
  option.value = '';
  option.textContent = label;
  select.append(option);
  select.value = '';
  select.disabled = true;
}

export function initEchoReaderApp() {
  const appNode = document.querySelector('[data-echo-app]');
  if (!appNode) {
    return;
  }

  const synth = window.speechSynthesis;
  const dropZone = appNode.querySelector('[data-echo-dropzone]');
  const fileInput = appNode.querySelector('[data-echo-file-input]');
  const fileMetaNode = appNode.querySelector('[data-echo-file-meta]');
  const textMetaNode = appNode.querySelector('[data-echo-text-meta]');
  const textArea = appNode.querySelector('[data-echo-text]');
  const sampleButton = appNode.querySelector('[data-echo-sample]');
  const clearButton = appNode.querySelector('[data-echo-clear]');
  const voiceSelect = appNode.querySelector('[data-echo-voice]');
  const voiceMetaNode = appNode.querySelector('[data-echo-voice-meta]');
  const profileCopyNode = appNode.querySelector('[data-echo-profile-copy]');
  const profileButtons = Array.from(appNode.querySelectorAll('[data-echo-profile]'));
  const rateInput = appNode.querySelector('[data-echo-rate]');
  const pitchInput = appNode.querySelector('[data-echo-pitch]');
  const volumeInput = appNode.querySelector('[data-echo-volume]');
  const rateValueNode = appNode.querySelector('[data-echo-rate-value]');
  const pitchValueNode = appNode.querySelector('[data-echo-pitch-value]');
  const volumeValueNode = appNode.querySelector('[data-echo-volume-value]');
  const waveformNode = appNode.querySelector('[data-echo-waveform]');
  const playButton = appNode.querySelector('[data-echo-play]');
  const pauseButton = appNode.querySelector('[data-echo-pause]');
  const stopButton = appNode.querySelector('[data-echo-stop]');
  const statusNode = appNode.querySelector('[data-echo-status]');
  const progressNode = appNode.querySelector('[data-echo-progress]');
  const progressLabelNode = appNode.querySelector('[data-echo-progress-label]');
  const outputNode = appNode.querySelector('[data-echo-output]');

  if (
    !dropZone ||
    !fileInput ||
    !fileMetaNode ||
    !textMetaNode ||
    !textArea ||
    !sampleButton ||
    !clearButton ||
    !voiceSelect ||
    !voiceMetaNode ||
    !profileCopyNode ||
    !rateInput ||
    !pitchInput ||
    !volumeInput ||
    !rateValueNode ||
    !pitchValueNode ||
    !volumeValueNode ||
    !waveformNode ||
    !playButton ||
    !pauseButton ||
    !stopButton ||
    !statusNode ||
    !progressNode ||
    !progressLabelNode ||
    !outputNode
  ) {
    return;
  }

  buildWaveformBars(waveformNode);

  const storedState = loadStoredState();
  const queryProfile = profileFromQuery();
  let activeProfileId = queryProfile || storedState?.profileId || PROFILE_CATALOG[0].id;
  let availableVoices = [];
  let wordRanges = [];
  let highlightedWordIndex = -1;
  let playbackChunks = [];
  let playbackChunkIndex = 0;
  let playbackSessionId = 0;
  let activeUtterance = null;
  let playing = false;
  let paused = false;
  let extracting = false;
  let previewRenderTimer = 0;
  let voicePollTimer = 0;
  let voicePollAttempts = 0;

  const setStatus = (message, tone = 'info') => {
    statusNode.textContent = message;
    statusNode.dataset.tone = tone;
  };

  const setProgress = (percent, label) => {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    progressNode.style.width = `${clamped}%`;
    progressLabelNode.textContent = label;
  };

  const setButtons = () => {
    const hasText = normalizeText(textArea.value).length > 0;
    const speechUnavailable = !synth || typeof window.SpeechSynthesisUtterance !== 'function';
    const voicesUnavailable = !availableVoices.length;

    playButton.disabled = speechUnavailable || voicesUnavailable || extracting || !hasText || (playing && !paused);
    pauseButton.disabled = speechUnavailable || !playing || paused;
    stopButton.disabled = speechUnavailable || (!playing && !paused);
    playButton.textContent = paused ? 'Resume' : 'Play';
  };

  const clearHighlights = () => {
    if (highlightedWordIndex >= 0 && wordRanges[highlightedWordIndex]) {
      wordRanges[highlightedWordIndex].node.classList.remove('is-active');
    }
    highlightedWordIndex = -1;
  };

  const highlightWord = (charIndex) => {
    if (!wordRanges.length) {
      return;
    }

    const nextIndex = findWordIndexForChar(wordRanges, charIndex);
    if (nextIndex === highlightedWordIndex || nextIndex < 0) {
      return;
    }

    clearHighlights();
    const target = wordRanges[nextIndex];
    target.node.classList.add('is-active');
    target.node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    highlightedWordIndex = nextIndex;
  };

  const updateTextMeta = () => {
    const normalized = normalizeText(textArea.value);
    textMetaNode.textContent = `${countWords(normalized).toLocaleString()} words · ${normalized.length.toLocaleString()} chars · ${formatMinutes(
      estimateMinutes(normalized, clampNumber(rateInput.value, 0.6, 1.6, 1)),
    )}`;
  };

  const syncSliderLabels = () => {
    rateValueNode.textContent = clampNumber(rateInput.value, 0.6, 1.6, 1).toFixed(2);
    pitchValueNode.textContent = clampNumber(pitchInput.value, 0.6, 1.5, 1).toFixed(2);
    volumeValueNode.textContent = clampNumber(volumeInput.value, 0.1, 1, 1).toFixed(2);
    updateTextMeta();
  };

  const persistState = () => {
    storeState({
      text: textArea.value,
      profileId: activeProfileId,
      voiceUri: voiceSelect.value,
      rate: clampNumber(rateInput.value, 0.6, 1.6, 1),
      pitch: clampNumber(pitchInput.value, 0.6, 1.5, 1),
      volume: clampNumber(volumeInput.value, 0.1, 1, 1),
    });
  };

  const schedulePreviewRender = () => {
    window.clearTimeout(previewRenderTimer);
    previewRenderTimer = window.setTimeout(() => {
      wordRanges = renderWordSurface(outputNode, normalizeText(textArea.value));
      highlightedWordIndex = -1;
    }, 80);
  };

  const refreshVoiceMeta = () => {
    const voice = availableVoices.find((entry) => entry.voiceURI === voiceSelect.value) || null;
    voiceMetaNode.textContent = formatVoiceMeta(voice, availableVoices.length);
  };

  const clearVoicePolling = () => {
    if (voicePollTimer) {
      window.clearInterval(voicePollTimer);
      voicePollTimer = 0;
    }
    voicePollAttempts = 0;
  };

  const applyProfile = (profileId, updateVoiceSelection = true) => {
    const profile = findProfile(profileId);
    activeProfileId = profile.id;
    profileCopyNode.textContent = profile.summary;

    profileButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.echoProfile === profile.id);
    });

    rateInput.value = profile.rate.toFixed(2);
    pitchInput.value = profile.pitch.toFixed(2);
    volumeInput.value = profile.volume.toFixed(2);
    syncSliderLabels();

    if (updateVoiceSelection && availableVoices.length) {
      const nextVoice = chooseVoiceForProfile(availableVoices, profile.id);
      if (nextVoice) {
        voiceSelect.value = nextVoice.voiceURI;
      }
    }

    refreshVoiceMeta();
    persistQueryProfile(profile.id);
    persistState();
  };

  const stopPlayback = (resetStatus = true) => {
    playbackSessionId += 1;
    playbackChunks = [];
    playbackChunkIndex = 0;
    activeUtterance = null;
    playing = false;
    paused = false;
    if (synth) {
      synth.cancel();
    }
    clearHighlights();
    setWaveformActive(waveformNode, false);
    if (resetStatus) {
      setStatus('Idle. Press Play to start reading.', 'info');
      setProgress(0, 'Idle');
    }
    setButtons();
  };

  const onPlaybackBoundary = (globalCharIndex, fullTextLength) => {
    const ratio = fullTextLength ? (globalCharIndex / fullTextLength) * 100 : 0;
    setProgress(ratio, `Reading chunk ${playbackChunkIndex + 1}/${playbackChunks.length}`);
    highlightWord(globalCharIndex);
  };

  const getSelectedVoice = () => {
    return availableVoices.find((entry) => entry.voiceURI === voiceSelect.value) || null;
  };

  const startChunkPlayback = (sessionId, normalizedText) => {
    if (sessionId !== playbackSessionId) {
      return;
    }

    if (playbackChunkIndex >= playbackChunks.length) {
      playing = false;
      paused = false;
      activeUtterance = null;
      setWaveformActive(waveformNode, false);
      setProgress(100, 'Complete');
      setStatus('Reading finished.', 'ok');
      setButtons();
      return;
    }

    const chunk = playbackChunks[playbackChunkIndex];
    const utterance = new window.SpeechSynthesisUtterance(chunk.text);
    const selectedVoice = getSelectedVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
    utterance.rate = clampNumber(rateInput.value, 0.6, 1.6, 1);
    utterance.pitch = clampNumber(pitchInput.value, 0.6, 1.5, 1);
    utterance.volume = clampNumber(volumeInput.value, 0.1, 1, 1);

    utterance.onstart = () => {
      if (sessionId !== playbackSessionId) {
        return;
      }
      playing = true;
      paused = false;
      activeUtterance = utterance;
      setWaveformActive(waveformNode, true);
      setStatus(`Reading with ${findProfile(activeProfileId).label}.`, 'ok');
      setButtons();
    };

    utterance.onboundary = (event) => {
      if (sessionId !== playbackSessionId || typeof event.charIndex !== 'number') {
        return;
      }
      onPlaybackBoundary(chunk.start + event.charIndex, normalizedText.length);
    };

    utterance.onerror = (event) => {
      if (sessionId !== playbackSessionId) {
        return;
      }
      playing = false;
      paused = false;
      activeUtterance = null;
      setWaveformActive(waveformNode, false);
      setStatus(`Speech synthesis error: ${event.error || 'unknown error'}.`, 'error');
      setButtons();
    };

    utterance.onend = () => {
      if (sessionId !== playbackSessionId) {
        return;
      }
      playbackChunkIndex += 1;
      if (playbackChunkIndex < playbackChunks.length) {
        startChunkPlayback(sessionId, normalizedText);
      } else {
        playing = false;
        paused = false;
        activeUtterance = null;
        setWaveformActive(waveformNode, false);
        setProgress(100, 'Complete');
        setStatus('Reading finished.', 'ok');
        setButtons();
      }
    };

    synth.speak(utterance);
  };

  const startPlayback = () => {
    if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') {
      setStatus('This browser does not support speech synthesis on this route.', 'error');
      return;
    }

    if (paused && activeUtterance) {
      synth.resume();
      paused = false;
      playing = true;
      setWaveformActive(waveformNode, true);
      setStatus('Reading resumed.', 'ok');
      setButtons();
      return;
    }

    const normalizedText = normalizeText(textArea.value);
    if (!normalizedText) {
      setStatus('Paste text or import a file before pressing Play.', 'error');
      return;
    }

    if (!availableVoices.length) {
      setStatus('The browser has not exposed any system voices yet. Wait a moment and try again.', 'error');
      return;
    }

    stopPlayback(false);
    playbackChunks = chunkTextForPlayback(normalizedText);
    playbackChunkIndex = 0;
    playbackSessionId += 1;
    const sessionId = playbackSessionId;
    wordRanges = renderWordSurface(outputNode, normalizedText);
    clearHighlights();
    setProgress(0, `Preparing ${playbackChunks.length} chunk(s)...`);
    setStatus('Starting browser playback...', 'info');
    setButtons();
    startChunkPlayback(sessionId, normalizedText);
  };

  const onFileSelected = async (file) => {
    stopPlayback(false);
    extracting = true;
    setButtons();
    setStatus(`Reading ${file.name}...`, 'info');
    setProgress(0, 'Importing file...');

    try {
      const extractedText = await extractTextFromFile(file, setStatus);
      if (!extractedText) {
        throw new Error('No readable text was found in this file.');
      }

      textArea.value = extractedText;
      fileMetaNode.textContent = safeFileMeta(file, extractedText);
      updateTextMeta();
      wordRanges = renderWordSurface(outputNode, extractedText);
      highlightedWordIndex = -1;
      setStatus('File imported. Adjust the voice and press Play.', 'ok');
      setProgress(0, 'Ready');
      persistState();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'File import failed.';
      textArea.value = '';
      fileMetaNode.textContent = file ? file.name : 'No file selected yet.';
      updateTextMeta();
      wordRanges = renderWordSurface(outputNode, '');
      setStatus(message, 'error');
      setProgress(0, 'Import failed');
    } finally {
      extracting = false;
      setButtons();
      fileInput.value = '';
    }
  };

  const populateVoices = (preserveSelection = true) => {
    if (!synth) {
      availableVoices = [];
      setVoiceSelectPlaceholder(voiceSelect, 'Speech synthesis unavailable');
      refreshVoiceMeta();
      setButtons();
      return false;
    }

    const voices = synth.getVoices();
    if (!voices.length) {
      availableVoices = [];
      setVoiceSelectPlaceholder(voiceSelect, 'Waiting for system voices...');
      refreshVoiceMeta();
      setButtons();
      return false;
    }

    const hadNoVoices = !availableVoices.length || voiceSelect.disabled;
    const previousValue = preserveSelection ? voiceSelect.value || storedState?.voiceUri || '' : '';
    availableVoices = [...voices].sort((left, right) => {
      const leftName = `${left.lang} ${left.name}`.toLowerCase();
      const rightName = `${right.lang} ${right.name}`.toLowerCase();
      return leftName.localeCompare(rightName);
    });

    voiceSelect.disabled = false;
    voiceSelect.innerHTML = '';
    availableVoices.forEach((voice) => {
      const option = document.createElement('option');
      option.value = voice.voiceURI;
      option.textContent = `${voice.name} · ${voice.lang || 'unknown'}`;
      voiceSelect.append(option);
    });

    const hasPrevious = previousValue && availableVoices.some((voice) => voice.voiceURI === previousValue);
    if (hasPrevious) {
      voiceSelect.value = previousValue;
    } else {
      const nextVoice = chooseVoiceForProfile(availableVoices, activeProfileId);
      if (nextVoice) {
        voiceSelect.value = nextVoice.voiceURI;
      }
    }

    refreshVoiceMeta();
    persistState();
    setButtons();
    if (hadNoVoices && !playing && !paused && !extracting) {
      setStatus('Voices ready. Paste text or import a file, then press Play.', 'ok');
      setProgress(0, 'Ready');
    }
    return true;
  };

  const startVoicePolling = () => {
    clearVoicePolling();
    if (populateVoices(true)) {
      return;
    }

    setStatus('Waiting for browser/system voices to load...', 'info');
    setProgress(0, 'Voice scan');

    voicePollTimer = window.setInterval(() => {
      voicePollAttempts += 1;
      if (populateVoices(true) || voicePollAttempts >= VOICE_POLL_MAX_ATTEMPTS) {
        clearVoicePolling();
        if (!availableVoices.length && !playing && !paused && !extracting) {
          setStatus('System voices are not available yet on this device or browser.', 'info');
          setProgress(0, 'Voice unavailable');
        }
      }
    }, VOICE_POLL_INTERVAL_MS);
  };

  textArea.value = storedState?.text || SAMPLE_TEXT;
  rateInput.value = clampNumber(storedState?.rate, 0.6, 1.6, 1).toFixed(2);
  pitchInput.value = clampNumber(storedState?.pitch, 0.6, 1.5, 1).toFixed(2);
  volumeInput.value = clampNumber(storedState?.volume, 0.1, 1, 1).toFixed(2);

  syncSliderLabels();
  fileMetaNode.textContent = 'No file selected yet.';
  wordRanges = renderWordSurface(outputNode, normalizeText(textArea.value));
  applyProfile(activeProfileId, false);
  if (!queryProfile && storedState) {
    rateInput.value = clampNumber(storedState.rate, 0.6, 1.6, 1).toFixed(2);
    pitchInput.value = clampNumber(storedState.pitch, 0.6, 1.5, 1).toFixed(2);
    volumeInput.value = clampNumber(storedState.volume, 0.1, 1, 1).toFixed(2);
    syncSliderLabels();
  }

  if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') {
    setStatus('Speech synthesis is not available in this browser.', 'error');
    setVoiceSelectPlaceholder(voiceSelect, 'Speech synthesis unavailable');
    refreshVoiceMeta();
    setButtons();
    return;
  }

  if (populateVoices(true)) {
    setStatus('Paste text or import a file, then press Play.', 'info');
    setProgress(0, 'Idle');
  } else {
    startVoicePolling();
  }
  setButtons();

  const onVoicesChanged = () => {
    clearVoicePolling();
    populateVoices(true);
  };

  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', onVoicesChanged);
  } else if (typeof synth.onvoiceschanged !== 'undefined') {
    synth.onvoiceschanged = onVoicesChanged;
  }

  profileButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyProfile(button.dataset.echoProfile || PROFILE_CATALOG[0].id, true);
      setStatus(`Profile switched to ${findProfile(activeProfileId).label}.`, 'info');
      setButtons();
    });
  });

  [rateInput, pitchInput, volumeInput].forEach((input) => {
    input.addEventListener('input', () => {
      syncSliderLabels();
      persistState();
    });
  });

  voiceSelect.addEventListener('change', () => {
    refreshVoiceMeta();
    persistState();
  });

  textArea.addEventListener('input', () => {
    if (playing || paused) {
      stopPlayback(false);
      setStatus('Text changed. Press Play to start a fresh pass.', 'info');
      setProgress(0, 'Edited');
    }
    fileMetaNode.textContent = 'Working from pasted or edited text.';
    updateTextMeta();
    schedulePreviewRender();
    persistState();
    setButtons();
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) {
      await onFileSelected(file);
    }
  });

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('is-dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('is-dragover');
  });

  dropZone.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropZone.classList.remove('is-dragover');
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      await onFileSelected(file);
    }
  });

  sampleButton.addEventListener('click', () => {
    stopPlayback(false);
    textArea.value = SAMPLE_TEXT;
    fileMetaNode.textContent = 'Loaded the built-in sample text.';
    updateTextMeta();
    wordRanges = renderWordSurface(outputNode, normalizeText(textArea.value));
    highlightedWordIndex = -1;
    setStatus('Sample text loaded.', 'ok');
    setProgress(0, 'Ready');
    persistState();
    setButtons();
  });

  clearButton.addEventListener('click', () => {
    stopPlayback(false);
    textArea.value = '';
    fileMetaNode.textContent = 'Canvas cleared.';
    updateTextMeta();
    wordRanges = renderWordSurface(outputNode, '');
    setStatus('Text cleared.', 'info');
    setProgress(0, 'Idle');
    persistState();
    setButtons();
  });

  playButton.addEventListener('click', startPlayback);

  pauseButton.addEventListener('click', () => {
    if (!synth || !playing || paused) {
      return;
    }
    synth.pause();
    paused = true;
    playing = true;
    setWaveformActive(waveformNode, false);
    setStatus('Reading paused.', 'info');
    setButtons();
  });

  stopButton.addEventListener('click', () => {
    stopPlayback();
  });

  window.addEventListener('beforeunload', () => {
    window.clearTimeout(previewRenderTimer);
    clearVoicePolling();
    if (synth) {
      if (typeof synth.removeEventListener === 'function') {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
      } else if (synth.onvoiceschanged === onVoicesChanged) {
        synth.onvoiceschanged = null;
      }
      synth.cancel();
    }
  });
}
