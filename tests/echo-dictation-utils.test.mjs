import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildEchoTranscriptFilename,
  buildEchoTranscriptMarkdown,
  encodeMonoPcm16Wav,
  mixAudioChannelsToMono,
  replaceFileExtension,
  resampleMonoAudio,
  shouldNormalizeAudioForTranscription,
} from '../src/scripts/echo-dictation-utils.js';

test('buildEchoTranscriptFilename normalizes the stem and enforces markdown extension', () => {
  assert.equal(buildEchoTranscriptFilename('Dictation Session 01'), 'dictation-session-01.md');
  assert.equal(buildEchoTranscriptFilename('  '), 'echo-dictation.md');
  assert.equal(buildEchoTranscriptFilename('already-md.md'), 'already-md.md');
});

test('buildEchoTranscriptMarkdown renders metadata, transcript text, and segments', () => {
  const markdown = buildEchoTranscriptMarkdown({
    title: 'ECHO Dictation',
    transcript: 'First line.\n\nSecond line.',
    language: 'en',
    durationSeconds: 18.4,
    wordCount: 4,
    sourceLabel: 'Browser dictation console',
    createdAt: '2026-04-12T04:35:00.000Z',
    segments: [
      { start: 0, end: 4.2, text: 'First line.' },
      { start: 4.2, end: 18.4, text: 'Second line.' },
    ],
  });

  assert.match(markdown, /^# ECHO Dictation/m);
  assert.match(markdown, /- Source: Browser dictation console/);
  assert.match(markdown, /- Language: en/);
  assert.match(markdown, /- Duration: 18\.4 seconds/);
  assert.match(markdown, /## Transcript/);
  assert.match(markdown, /First line\.\n\nSecond line\./);
  assert.match(markdown, /## Segments/);
  assert.match(markdown, /\[00:00\.000 -> 00:04\.200\] First line\./);
  assert.match(markdown, /\[00:04\.200 -> 00:18\.400\] Second line\./);
});

test('shouldNormalizeAudioForTranscription flags mp4-family audio containers', () => {
  assert.equal(shouldNormalizeAudioForTranscription({ mimeType: 'audio/mp4', filename: 'Recording.m4a' }), true);
  assert.equal(shouldNormalizeAudioForTranscription({ mimeType: 'audio/x-m4a', filename: 'clip.m4a' }), true);
  assert.equal(shouldNormalizeAudioForTranscription({ mimeType: 'video/mp4', filename: 'clip.mp4' }), true);
  assert.equal(shouldNormalizeAudioForTranscription({ mimeType: 'audio/wav', filename: 'clip.wav' }), false);
  assert.equal(shouldNormalizeAudioForTranscription({ mimeType: 'audio/webm', filename: 'clip.webm' }), false);
});

test('replaceFileExtension swaps the suffix or appends one when missing', () => {
  assert.equal(replaceFileExtension('Recording.m4a', 'wav'), 'Recording.wav');
  assert.equal(replaceFileExtension('recording', 'wav'), 'recording.wav');
  assert.equal(replaceFileExtension('', 'wav'), 'echo-dictation.wav');
});

test('mixAudioChannelsToMono averages channels frame by frame', () => {
  const mono = mixAudioChannelsToMono([
    new Float32Array([0, 1, -1, 0.5]),
    new Float32Array([1, 1, 1, -0.5]),
  ]);

  assert.deepEqual(Array.from(mono).map((value) => Number(value.toFixed(3))), [0.5, 1, 0, 0]);
});

test('resampleMonoAudio preserves samples when sample rates match', () => {
  const source = new Float32Array([0, 0.25, -0.25, 1]);
  const resampled = resampleMonoAudio(source, 16000, 16000);
  assert.deepEqual(Array.from(resampled), Array.from(source));
});

test('encodeMonoPcm16Wav writes a valid wav header and payload size', () => {
  const bytes = encodeMonoPcm16Wav(new Float32Array([0, -1, 1]), 16000);
  const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
  const view = new DataView(bytes.buffer);

  assert.equal(ascii(0, 4), 'RIFF');
  assert.equal(ascii(8, 12), 'WAVE');
  assert.equal(ascii(12, 16), 'fmt ');
  assert.equal(ascii(36, 40), 'data');
  assert.equal(view.getUint32(24, true), 16000);
  assert.equal(view.getUint32(40, true), 6);
  assert.equal(bytes.length, 50);
});
