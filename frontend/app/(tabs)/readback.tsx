import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';

import { colors, mono, type, sans } from '../../src/theme';
import { api, Voice, WordTiming } from '../../src/api';
import { wordAndCharCount, truncateMiddle } from '../../src/utils';
import { pendingDraft } from '../../src/store';

const h = {
  light: () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium: () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  select: () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
  },
  success: () => {
    if (Platform.OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
};

export default function ReadbackScreen() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState<string>('alloy');
  const [speed, setSpeed] = useState<number>(1.0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [saveHint, setSaveHint] = useState<string | null>(null);

  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [words, setWords] = useState<WordTiming[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(-1);

  const player: AudioPlayer = useAudioPlayer(audioUri ? { uri: audioUri } : null, 80);
  const status: AudioStatus = useAudioPlayerStatus(player);
  const isPlaying = !!status?.playing;
  const positionMs = Math.max(0, Math.round((status?.currentTime ?? 0) * 1000));
  const durationMs = Math.max(0, Math.round((status?.duration ?? 0) * 1000));

  const wordsRef = useRef<WordTiming[]>([]);
  wordsRef.current = words;
  const lastActiveRef = useRef<number>(-1);

  const { words: wc, chars: cc, mins } = wordAndCharCount(text);

  // ------------------------ Voices + audio mode
  useEffect(() => {
    (async () => {
      try {
        const { voices, default: def } = await api.getVoices();
        setVoices(voices);
        if (def) setVoiceId(def);
      } catch (e) {
        console.warn('voices fetch failed', e);
      }
      try {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      } catch {}
    })();
  }, []);

  // Load pending draft from Library on focus
  useFocusEffect(
    useCallback(() => {
      const pending = pendingDraft.consume();
      if (pending?.text != null) {
        setText(pending.text);
        setFilename(pending.title || null);
        setError(null);
        resetAudio();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // ------------------------ Playback-driven word tracking + haptic
  useEffect(() => {
    const ws = wordsRef.current;
    if (!ws.length || !audioUri) return;
    const t = positionMs / 1000;
    let idx = -1;
    for (let i = 0; i < ws.length; i++) {
      if (t >= ws[i].start && t <= ws[i].end) {
        idx = i;
        break;
      }
      if (t < ws[i].start) {
        idx = Math.max(0, i - 1);
        break;
      }
    }
    if (idx === -1 && t >= ws[ws.length - 1].end) idx = ws.length - 1;
    if (idx !== lastActiveRef.current) {
      lastActiveRef.current = idx;
      setActiveIdx(idx);
      // haptic on sentence-ending punctuation only (avoid spam)
      if (isPlaying && idx >= 0) {
        const w = ws[idx].word;
        if (w && /[.!?,;:]$/.test(w)) h.select();
      }
    }
  }, [positionMs, audioUri, isPlaying]);

  // When playback finishes
  useEffect(() => {
    if (status?.didJustFinish) {
      setActiveIdx(-1);
      lastActiveRef.current = -1;
      h.light();
    }
  }, [status?.didJustFinish]);

  // ------------------------ Helpers
  const resetAudio = useCallback(() => {
    try {
      player.pause();
    } catch {}
    setAudioUri(null);
    setWords([]);
    setActiveIdx(-1);
    lastActiveRef.current = -1;
  }, [player]);

  // ------------------------ Actions
  const onLoadSample = useCallback(async () => {
    h.select();
    try {
      const r = await api.getSampleText();
      setText(r.text);
      setFilename(null);
      setError(null);
      resetAudio();
    } catch (e: any) {
      setError(e?.message || 'Failed to load sample');
    }
  }, [resetAudio]);

  const onClear = useCallback(() => {
    h.select();
    setText('');
    setFilename(null);
    setError(null);
    setSaveHint(null);
    resetAudio();
  }, [resetAudio]);

  const onImport = useCallback(async () => {
    h.light();
    try {
      setError(null);
      const res = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
        type: [
          'text/plain',
          'text/markdown',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          '*/*',
        ],
      });
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      const name = (a.name || '').toLowerCase();
      const ok = ['.txt', '.md', '.pdf', '.docx'].some((ext) => name.endsWith(ext));
      if (!ok) {
        setError('Unsupported file. Use .txt, .md, .docx, or .pdf.');
        return;
      }
      setLoading(true);
      setFilename(a.name || null);
      const parsed = await api.parseFile(
        a.uri,
        a.name || 'file',
        a.mimeType || 'application/octet-stream'
      );
      setText(parsed.text || '');
      resetAudio();
      h.success();
    } catch (e: any) {
      setError(e?.message || 'File import failed');
    } finally {
      setLoading(false);
    }
  }, [resetAudio]);

  const onPlay = useCallback(async () => {
    setError(null);
    const t = (text || '').trim();
    if (!t) {
      setError('Paste text or import a file first.');
      return;
    }
    // If audio already generated, toggle play/pause
    if (audioUri) {
      try {
        if (isPlaying) {
          player.pause();
          h.light();
        } else {
          player.play();
          h.medium();
        }
      } catch {}
      return;
    }
    try {
      setGenerating(true);
      h.light();
      const r = await api.generateTTS(t, voiceId, speed);
      setWords(r.words);
      setActiveIdx(-1);
      lastActiveRef.current = -1;
      const uri = `data:${r.mime};base64,${r.audio_base64}`;
      setAudioUri(uri);
      // Start playback shortly after source becomes available
      setTimeout(() => {
        try {
          player.play();
          h.medium();
        } catch {}
      }, 120);
    } catch (e: any) {
      setError(e?.message || 'Readback failed');
    } finally {
      setGenerating(false);
    }
  }, [text, voiceId, speed, audioUri, isPlaying, player]);

  const onStop = useCallback(() => {
    h.medium();
    try {
      player.pause();
      player.seekTo(0);
    } catch {}
    setActiveIdx(-1);
    lastActiveRef.current = -1;
    // Also discard generated audio so next PLAY regenerates with latest text/voice/speed
    setAudioUri(null);
    setWords([]);
  }, [player]);

  const onSaveDraft = useCallback(async () => {
    const t = text.trim();
    if (!t) {
      setError('Nothing to save — paste or import text first.');
      return;
    }
    try {
      const title =
        filename?.replace(/\.(txt|md|pdf|docx)$/i, '') ||
        t.split(/\s+/).slice(0, 6).join(' ').slice(0, 60) ||
        'Untitled draft';
      await api.saveDraft(title, t);
      setSaveHint('Saved to Library');
      h.success();
      setTimeout(() => setSaveHint(null), 2000);
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    }
  }, [text, filename]);

  // When text, voice, or speed changes, invalidate existing audio
  useEffect(() => {
    if (audioUri) {
      resetAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceId, speed]);

  const progress = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;
  const selectedVoice = voices.find((v) => v.id === voiceId);

  const readbackContent = useMemo(() => {
    if (!words.length) {
      return (
        <Text style={styles.readbackPlaceholder}>
          {text ? 'Press PLAY to begin readback with live word tracking.' : '> awaiting draft input'}
        </Text>
      );
    }
    return (
      <Text style={styles.readbackBody}>
        {words.map((w, i) => (
          <Text
            key={`${w.index}-${i}`}
            style={[
              styles.word,
              i === activeIdx && styles.wordActive,
              i < activeIdx && styles.wordPast,
            ]}
          >
            {w.word + ' '}
          </Text>
        ))}
      </Text>
    );
  }, [words, activeIdx, text]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.flex}>
            {/* Header */}
            <View style={styles.header} testID="readback-header">
              <View style={styles.headerRow}>
                <Text style={styles.logo}>ECHO</Text>
                <View style={styles.caret}>
                  <Text style={styles.caretTxt}>▸</Text>
                </View>
                <Text style={styles.sectionTitle}>Readback</Text>
                <View style={{ flex: 1 }} />
                <View style={styles.pill}>
                  <View style={styles.pillDot} />
                  <Text style={styles.pillTxt}>ON DEVICE</Text>
                </View>
              </View>
              <Text style={styles.tagline}>Hear your draft, on this device.</Text>
            </View>

            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Draft intake panel */}
              <View style={styles.panel} testID="draft-intake-panel">
                <View style={styles.panelHeader}>
                  <Text style={styles.caption}>Draft Intake</Text>
                  <View style={styles.toolbar}>
                    <TouchableOpacity
                      onPress={onLoadSample}
                      style={styles.toolBtn}
                      testID="load-sample-button"
                    >
                      <Ionicons name="sparkles-outline" size={12} color={colors.textSecondary} />
                      <Text style={styles.toolBtnTxt}>SAMPLE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={onSaveDraft}
                      style={styles.toolBtn}
                      testID="save-draft-button"
                    >
                      <Ionicons name="bookmark-outline" size={12} color={colors.amber} />
                      <Text style={[styles.toolBtnTxt, { color: colors.amber }]}>SAVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={onClear}
                      style={styles.toolBtn}
                      testID="clear-button"
                    >
                      <Ionicons name="close" size={14} color={colors.textSecondary} />
                      <Text style={styles.toolBtnTxt}>CLEAR</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onImport}
                  activeOpacity={0.85}
                  style={styles.dropzone}
                  testID="import-file-button"
                >
                  {loading ? (
                    <ActivityIndicator color={colors.amber} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={22} color={colors.textMuted} />
                      <Text style={styles.dropzoneTitle}>
                        {filename ? truncateMiddle(filename, 36) : 'Choose a file'}
                      </Text>
                      <Text style={styles.dropzoneSub}>
                        .txt · .md · .docx · .pdf
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.textFieldWrap}>
                  <Text style={styles.miniLabel}>Text Body</Text>
                  <TextInput
                    value={text}
                    onChangeText={(v) => {
                      setText(v);
                      if (audioUri) resetAudio();
                    }}
                    multiline
                    placeholder="Paste notes, drafts, or finished docs…"
                    placeholderTextColor={colors.textFaint}
                    style={styles.textInput}
                    textAlignVertical="top"
                    testID="text-intake-input"
                  />
                </View>

                <View style={styles.statsRow}>
                  <StatCell label="Words" value={String(wc)} />
                  <StatCell label="Chars" value={String(cc)} />
                  <StatCell label="Est" value={`${mins} min`} />
                </View>

                {saveHint ? (
                  <View style={styles.saveToast} testID="save-toast">
                    <Ionicons name="checkmark-circle" size={12} color={colors.emerald} />
                    <Text style={styles.saveToastTxt}>{saveHint}</Text>
                  </View>
                ) : null}
              </View>

              {/* Voice picker */}
              <View style={styles.panelLite}>
                <View style={styles.panelHeader}>
                  <Text style={styles.caption}>Voice Profile</Text>
                  {selectedVoice ? (
                    <Text style={styles.selectedVoiceTag}>{selectedVoice.tag}</Text>
                  ) : null}
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.voiceRow}
                >
                  {voices.map((v) => {
                    const active = v.id === voiceId;
                    return (
                      <TouchableOpacity
                        key={v.id}
                        onPress={() => {
                          h.select();
                          setVoiceId(v.id);
                        }}
                        style={[styles.voiceChip, active && styles.voiceChipActive]}
                        testID={`voice-chip-${v.id}`}
                      >
                        <Text style={[styles.voiceChipTxt, active && styles.voiceChipTxtActive]}>
                          {v.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Transport */}
              <View style={styles.transport} testID="transport-panel">
                <View style={styles.transportTop}>
                  <Text style={styles.caption}>Transport</Text>
                  <View style={styles.speedRow}>
                    {[0.75, 1.0, 1.25, 1.5].map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => {
                          h.select();
                          setSpeed(s);
                        }}
                        style={[styles.speedChip, speed === s && styles.speedChipActive]}
                        testID={`speed-${s}`}
                      >
                        <Text style={[styles.speedTxt, speed === s && styles.speedTxtActive]}>
                          {s}x
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeTxt}>{fmt(positionMs)}</Text>
                  <Text style={[styles.timeTxt, { color: colors.textMuted }]}>
                    {fmt(durationMs)}
                  </Text>
                </View>

                <View style={styles.controlsRow}>
                  <TouchableOpacity
                    onPress={onStop}
                    style={styles.iconBtn}
                    testID="stop-button"
                  >
                    <Ionicons name="stop" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onPlay}
                    disabled={generating}
                    style={[styles.playBtn, generating && { opacity: 0.7 }]}
                    testID="play-pause-button"
                  >
                    {generating ? (
                      <ActivityIndicator color={colors.bg} />
                    ) : (
                      <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={22}
                        color={colors.bg}
                      />
                    )}
                  </TouchableOpacity>
                  <View style={styles.iconBtn}>
                    <Text style={styles.voiceShort}>
                      {selectedVoice?.name?.toUpperCase()?.slice(0, 3) || '---'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Live readback pane */}
              <View style={styles.readbackPanel} testID="readback-pane">
                <View style={styles.panelHeader}>
                  <Text style={styles.caption}>Live Readback</Text>
                  <View style={styles.pillSmall}>
                    <View style={[styles.pillDot, isPlaying && { backgroundColor: colors.amber }]} />
                    <Text style={styles.pillTxt}>
                      {isPlaying ? 'TRACKING' : words.length ? 'PAUSED' : 'IDLE'}
                    </Text>
                  </View>
                </View>
                {readbackContent}
              </View>

              {error ? (
                <View style={styles.errorBox} testID="error-box">
                  <Text style={styles.errorTxt}>! {error}</Text>
                </View>
              ) : null}

              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function fmt(ms: number) {
  if (!isFinite(ms) || ms <= 0) return '00:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    fontFamily: mono, fontSize: 20, color: colors.amber, letterSpacing: 3,
    fontWeight: '600',
  },
  caret: { paddingHorizontal: 2 },
  caretTxt: { fontFamily: mono, color: colors.textMuted, fontSize: 12 },
  sectionTitle: {
    fontFamily: mono, fontSize: 13, color: colors.textSecondary,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  tagline: { fontFamily: sans, fontSize: 15, color: colors.textSecondary, marginTop: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillSmall: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  pillDot: { width: 5, height: 5, backgroundColor: colors.textMuted },
  pillTxt: { fontFamily: mono, fontSize: 9.5, letterSpacing: 2, color: colors.textMuted },

  panel: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, marginTop: 16,
  },
  panelLite: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, marginTop: 12,
  },
  panelHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  caption: { ...type.caption },
  toolbar: { flexDirection: 'row', gap: 6 },
  toolBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  toolBtnTxt: {
    fontFamily: mono, fontSize: 10, letterSpacing: 1.8, color: colors.textSecondary,
  },

  dropzone: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderDashed,
    paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center',
    backgroundColor: colors.panel, gap: 6,
  },
  dropzoneTitle: {
    fontFamily: sans, fontSize: 14, color: colors.textPrimary, marginTop: 2,
  },
  dropzoneSub: {
    fontFamily: mono, fontSize: 10, letterSpacing: 1.6, color: colors.textMuted,
  },

  textFieldWrap: { marginTop: 14 },
  miniLabel: {
    fontFamily: mono, fontSize: 10, letterSpacing: 2, color: colors.textMuted,
    marginBottom: 6,
  },
  textInput: {
    minHeight: 140,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    backgroundColor: colors.panel,
    paddingHorizontal: 12, paddingVertical: 12,
    fontFamily: sans, fontSize: 15, lineHeight: 23, color: colors.textPrimary,
  },

  statsRow: {
    flexDirection: 'row', marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border, paddingTop: 10,
  },
  statCell: { flex: 1 },
  statLabel: {
    fontFamily: mono, fontSize: 9.5, letterSpacing: 2, color: colors.textMuted,
  },
  statValue: {
    fontFamily: mono, fontSize: 14, color: colors.textPrimary, marginTop: 3,
  },

  saveToast: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, paddingHorizontal: 10, paddingVertical: 7,
    backgroundColor: 'rgba(74,222,128,0.06)', borderLeftWidth: 2, borderLeftColor: colors.emerald,
  },
  saveToastTxt: { fontFamily: mono, fontSize: 11, letterSpacing: 1.4, color: colors.emerald },

  voiceRow: { gap: 8, paddingRight: 8 },
  voiceChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  voiceChipActive: {
    backgroundColor: colors.amber, borderColor: colors.amber,
  },
  voiceChipTxt: {
    fontFamily: mono, fontSize: 11.5, letterSpacing: 1.4, color: colors.textSecondary,
  },
  voiceChipTxtActive: { color: colors.bg, fontWeight: '700' },
  selectedVoiceTag: {
    fontFamily: mono, fontSize: 10, color: colors.textMuted, letterSpacing: 1.2,
  },

  transport: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    padding: 14, marginTop: 12,
  },
  transportTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  speedRow: { flexDirection: 'row', gap: 6 },
  speedChip: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  speedChipActive: {
    backgroundColor: colors.surfaceElevated, borderColor: colors.amber,
  },
  speedTxt: {
    fontFamily: mono, fontSize: 10.5, color: colors.textMuted, letterSpacing: 1,
  },
  speedTxtActive: { color: colors.amber },
  progressTrack: {
    height: 3, backgroundColor: colors.border, width: '100%', overflow: 'hidden',
  },
  progressFill: { height: 3, backgroundColor: colors.amber },
  timeRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 14,
  },
  timeTxt: { fontFamily: mono, fontSize: 11, color: colors.textSecondary, letterSpacing: 1 },

  controlsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 52, height: 52, borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  playBtn: {
    width: 72, height: 72, backgroundColor: colors.amber,
    alignItems: 'center', justifyContent: 'center',
  },
  voiceShort: {
    fontFamily: mono, fontSize: 11, letterSpacing: 2, color: colors.textMuted,
  },

  readbackPanel: {
    backgroundColor: colors.panel,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    padding: 16, marginTop: 12, minHeight: 180,
  },
  readbackBody: {
    fontFamily: sans, fontSize: 16, lineHeight: 27, color: colors.textSecondary,
  },
  word: { color: colors.textSecondary },
  wordActive: {
    color: colors.amber, backgroundColor: colors.amberDim, fontWeight: '700',
  },
  wordPast: { color: colors.textPrimary },
  readbackPlaceholder: {
    fontFamily: mono, fontSize: 13, color: colors.textMuted, letterSpacing: 0.5,
  },
  errorBox: {
    marginTop: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.red,
    backgroundColor: colors.redDim, padding: 10,
  },
  errorTxt: { fontFamily: mono, fontSize: 12, color: colors.red },
});
