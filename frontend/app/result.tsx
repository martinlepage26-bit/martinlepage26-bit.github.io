import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ChevronLeft, Sparkles, RotateCcw, Share2, Download, X, Quote } from 'lucide-react-native';

import StarryBackground from '../src/components/StarryBackground.js';
import LangToggle from '../src/components/LangToggle.js';
import ElementWheel from '../src/components/ElementWheel.js';
import { Heading, BodyText, Label, Chip, SectionCard } from '../src/components/UI.js';
import { useLang } from '../src/context/Lang.js';
import { COLORS, FONTS } from '../src/theme.js';
import { chartToPayload } from '../src/lib/chart.js';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Result() {
  const { chart: chartRaw } = useLocalSearchParams();
  const router = useRouter();
  const { t, lang } = useLang();

  const chart = useMemo(() => {
    try {
      return chartRaw ? JSON.parse(typeof chartRaw === 'string' ? chartRaw : chartRaw[0]) : null;
    } catch {
      return null;
    }
  }, [chartRaw]);

  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardUri, setCardUri] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [cardVariant, setCardVariant] = useState('data'); // 'data' | 'testimonial'
  const [readingCardUri, setReadingCardUri] = useState(null);

  if (!chart) {
    return (
      <StarryBackground>
        <SafeAreaView style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
          <Heading level={2}>{t('error')}</Heading>
          <TouchableOpacity onPress={() => router.replace('/chart')} style={{ marginTop: 20 }}>
            <Text style={{ color: COLORS.gold }}>{t('cta_generate')}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </StarryBackground>
    );
  }

  const sign = chart.sign[lang];

  const generateReading = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = chartToPayload(chart, lang);
      const r = await fetch(`${BACKEND_URL}/api/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart: payload, lang, depth: 'deep' }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setReading(data.text);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const openShareCard = async (variant = 'data') => {
    setCardVariant(variant);
    const existing = variant === 'testimonial' ? readingCardUri : cardUri;
    if (existing) {
      setCardOpen(true);
      return;
    }
    setCardLoading(true);
    setError(null);
    try {
      const payload = chartToPayload(chart, lang);
      const body = {
        chart: payload,
        lang,
        variant,
        ...(variant === 'testimonial' ? { reading_excerpt: reading } : {}),
      };
      const r = await fetch(`${BACKEND_URL}/api/share-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const reader = new FileReader();
      const uri = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      if (variant === 'testimonial') setReadingCardUri(uri);
      else setCardUri(uri);
      setCardOpen(true);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setCardLoading(false);
    }
  };

  const activeCardUri = cardVariant === 'testimonial' ? readingCardUri : cardUri;

  const handleShareOrDownload = async () => {
    if (!activeCardUri) return;
    const slug = cardVariant === 'testimonial' ? 'reading' : 'chart';
    if (Platform.OS === 'web') {
      const a = document.createElement('a');
      a.href = activeCardUri;
      a.download = `gaia-${slug}-${sign.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      try {
        await Share.share({
          url: activeCardUri,
          message: lang === 'fr'
            ? `Ma charte GAIA : ${sign.name}`
            : `My GAIA chart: ${sign.name}`,
        });
      } catch {
        /* user cancelled */
      }
    }
  };

  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="result-scroll"
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="back-from-result"
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityLabel={t('back')}
            >
              <ChevronLeft size={22} color={COLORS.gold} strokeWidth={1.6} />
            </TouchableOpacity>
            <LangToggle />
          </View>

          <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center' }}>
            <Label>{t('your_sign')}</Label>
            <Text style={styles.signName}>{sign.name}</Text>
            <Text style={styles.signSubtitle}>{sign.subtitle}</Text>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(900).delay(200)} style={styles.wheelWrap}>
            <ElementWheel activeElements={chart.elements} size={280} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(700).delay(400)}>
            <SectionCard testID="card-sign-opening" title={sign.name.toUpperCase()}>
              <BodyText>{sign.opening}</BodyText>
            </SectionCard>

            <SectionCard testID="card-chart-fields">
              <Row label={t('elements_label')} testID="row-elements">
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {chart.elements.map((el) => (
                    <Chip key={el} label={el} />
                  ))}
                </View>
              </Row>
              <Row label={t('solar_season')} testID="row-solar-season">
                <BodyText>{translateSeason(chart.solar_season, lang)}</BodyText>
              </Row>
              <Row label={t('civic_season')} testID="row-civic-season">
                <BodyText>{chart.civic_season}</BodyText>
              </Row>
              <Row label={t('cohort')} testID="row-cohort">
                <BodyText>{chart.cohort_position}</BodyText>
              </Row>
              <Row label={t('festival')} testID="row-festival">
                <BodyText>{chart.festival_proximity}</BodyText>
              </Row>
              <Row label={t('weather_imprint')} testID="row-weather">
                <BodyText>{chart.weather_imprint}</BodyText>
              </Row>
            </SectionCard>

            <SectionCard testID="card-sign-depth" title={t('imprint').toUpperCase()}>
              <BodyText>{sign.imprint}</BodyText>
              <View style={{ height: 14 }} />
              <Label>{t('shadow')}</Label>
              <BodyText>{sign.shadow}</BodyText>
              <View style={{ height: 14 }} />
              <Label>{t('ritual')}</Label>
              <BodyText style={{ fontStyle: 'italic' }}>{sign.ritual}</BodyText>
            </SectionCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(700).delay(600)}>
            {reading ? (
              <SectionCard testID="card-ai-reading" title={t('deep_reading').toUpperCase()}>
                <View testID="deep-reading-text">
                  {reading.split(/\n\n+/).map((para, idx) => (
                    <BodyText key={idx} style={{ marginBottom: 14 }}>
                      {para.trim()}
                    </BodyText>
                  ))}
                </View>
              </SectionCard>
            ) : (
              <TouchableOpacity
                testID="generate-deep-reading"
                style={[styles.deepBtn, loading && styles.deepBtnLoading]}
                onPress={generateReading}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <>
                    <ActivityIndicator color={COLORS.gold} />
                    <Text style={styles.deepBtnText}>{t('deep_reading_loading')}</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} color={COLORS.gold} strokeWidth={1.6} />
                    <Text style={styles.deepBtnText}>{t('deep_reading')}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {error ? (
              <Text style={styles.error}>{t('error')} — {error}</Text>
            ) : null}

            {/* Share card CTAs */}
            <TouchableOpacity
              testID="open-share-card"
              style={[styles.shareBtn, cardLoading && cardVariant === 'data' && styles.deepBtnLoading]}
              onPress={() => openShareCard('data')}
              disabled={cardLoading}
              activeOpacity={0.85}
            >
              {cardLoading && cardVariant === 'data' ? (
                <>
                  <ActivityIndicator color={COLORS.terracotta} />
                  <Text style={styles.shareBtnText}>
                    {lang === 'fr' ? 'Composition de la carte…' : 'Composing your card…'}
                  </Text>
                </>
              ) : (
                <>
                  <Share2 size={15} color={COLORS.terracotta} strokeWidth={1.6} />
                  <Text style={styles.shareBtnText}>
                    {lang === 'fr' ? 'Partager cette charte' : 'Share this chart'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {reading ? (
              <TouchableOpacity
                testID="open-share-reading"
                style={[styles.shareBtn, cardLoading && cardVariant === 'testimonial' && styles.deepBtnLoading]}
                onPress={() => openShareCard('testimonial')}
                disabled={cardLoading}
                activeOpacity={0.85}
              >
                {cardLoading && cardVariant === 'testimonial' ? (
                  <>
                    <ActivityIndicator color={COLORS.gold} />
                    <Text style={[styles.shareBtnText, { color: COLORS.gold }]}>
                      {lang === 'fr' ? 'Composition du témoignage…' : 'Composing testimonial…'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Quote size={15} color={COLORS.gold} strokeWidth={1.6} />
                    <Text style={[styles.shareBtnText, { color: COLORS.gold }]}>
                      {lang === 'fr' ? 'Partager cette lecture' : 'Share this reading'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}
          </Animated.View>

          <TouchableOpacity
            testID="regenerate"
            style={styles.regen}
            onPress={() => router.replace('/chart')}
            activeOpacity={0.7}
          >
            <RotateCcw size={14} color={COLORS.textMuted} strokeWidth={1.4} />
            <Text style={styles.regenText}>{t('regenerate')}</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>{t('disclaimer')}</Text>
        </ScrollView>

        {/* Share-card preview modal */}
        <Modal
          visible={cardOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCardOpen(false)}
        >
          <View style={styles.modalRoot} testID="share-card-modal">
            <TouchableOpacity
              testID="close-share-card"
              style={styles.modalClose}
              onPress={() => setCardOpen(false)}
              accessibilityLabel={t('back')}
            >
              <X size={22} color={COLORS.text} strokeWidth={1.6} />
            </TouchableOpacity>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {activeCardUri ? (
                <Image
                  source={{ uri: activeCardUri }}
                  style={styles.cardImage}
                  resizeMode="contain"
                  testID="share-card-image"
                />
              ) : null}
              <TouchableOpacity
                testID="download-share-card"
                style={styles.downloadBtn}
                activeOpacity={0.85}
                onPress={handleShareOrDownload}
              >
                {Platform.OS === 'web' ? (
                  <Download size={16} color={COLORS.bg} strokeWidth={2} />
                ) : (
                  <Share2 size={16} color={COLORS.bg} strokeWidth={2} />
                )}
                <Text style={styles.downloadBtnText}>
                  {Platform.OS === 'web'
                    ? (lang === 'fr' ? 'Télécharger PNG' : 'Download PNG')
                    : (lang === 'fr' ? 'Partager' : 'Share')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.modalHint}>
                {lang === 'fr'
                  ? (Platform.OS === 'web'
                      ? 'Astuce : tu peux aussi clic-droit sur l\'image pour la copier.'
                      : 'Astuce : appui long sur l\'image pour l\'enregistrer.')
                  : (Platform.OS === 'web'
                      ? 'Tip: you can also right-click the image to copy it.'
                      : 'Tip: long-press the image to save it to your photos.')}
              </Text>
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </StarryBackground>
  );
}

function Row({ label, children, testID }) {
  return (
    <View style={rowStyles.row} testID={testID}>
      <Text style={rowStyles.label}>{label}</Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function translateSeason(key, lang) {
  const m = {
    en: { winter: 'Winter', spring: 'Spring', summer: 'Summer', autumn: 'Autumn' },
    fr: { winter: 'Hiver', spring: 'Printemps', summer: 'Été', autumn: 'Automne' },
  };
  return m[lang]?.[key] || key;
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  label: {
    width: 110,
    color: COLORS.textDim,
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingTop: 2,
  },
});

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 80,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
  },
  signName: {
    color: COLORS.gold,
    fontFamily: FONTS.serifBold,
    fontSize: 36,
    lineHeight: 42,
    marginTop: 8,
    textAlign: 'center',
  },
  signSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  wheelWrap: {
    alignItems: 'center',
    marginVertical: 30,
  },
  deepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
    backgroundColor: 'rgba(212,175,55,0.06)',
    marginBottom: 16,
  },
  deepBtnLoading: {
    opacity: 0.8,
  },
  deepBtnText: {
    color: COLORS.gold,
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(194,122,98,0.5)',
    backgroundColor: 'rgba(194,122,98,0.06)',
    marginBottom: 8,
  },
  shareBtnText: {
    color: COLORS.terracotta,
    fontFamily: FONTS.bodySemi,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(7,9,12,0.96)',
    padding: 20,
  },
  modalClose: {
    position: 'absolute',
    top: 44,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
    backgroundColor: 'rgba(21,25,33,0.8)',
    zIndex: 10,
  },
  modalScroll: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  cardImage: {
    width: '100%',
    maxWidth: 420,
    aspectRatio: 1080 / 1350,
    borderRadius: 18,
    marginBottom: 22,
    backgroundColor: COLORS.surface,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 999,
    marginBottom: 18,
  },
  downloadBtnText: {
    color: COLORS.bg,
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  modalHint: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 320,
  },
  error: {
    color: COLORS.terracotta,
    fontFamily: FONTS.body,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  regen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  regenText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  disclaimer: {
    color: COLORS.textDim,
    fontFamily: FONTS.body,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
