import React, { useEffect, useState, useCallback } from 'react';
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
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Compass, Sparkles, BookOpen, LandPlot, CircleDot, Info, Sunrise, Moon, Clock, Sparkle, Share2, Download, X } from 'lucide-react-native';

import StarryBackground from '../src/components/StarryBackground.js';
import LangToggle from '../src/components/LangToggle.js';
import { Heading, BodyText, Label, Chip } from '../src/components/UI.js';
import { useLang } from '../src/context/Lang.js';
import { COLORS, FONTS } from '../src/theme.js';
import { SIGNS } from '../src/data/gaia.js';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

function QuickLink({ icon: Icon, title, subtitle, onPress, testID }) {
  return (
    <TouchableOpacity
      testID={testID}
      style={styles.linkCard}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <View style={styles.linkIcon}>
        <Icon size={20} color={COLORS.gold} strokeWidth={1.4} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Home() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [daily, setDaily] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [deepReading, setDeepReading] = useState(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepError, setDeepError] = useState(null);

  const loadDaily = useCallback(async () => {
    setLoadingDaily(true);
    try {
      const hour = new Date().getHours();
      const qs = new URLSearchParams({ hour: String(hour), lang });
      const r = await fetch(`${BACKEND_URL}/api/daily?${qs.toString()}`);
      const data = await r.json();
      setDaily(data);
    } catch {
      setDaily(null);
    } finally {
      setLoadingDaily(false);
    }
  }, [lang]);

  useEffect(() => {
    loadDaily();
    // Refresh every 5 min so time-band crossings (e.g. 11→12) update automatically.
    const id = setInterval(loadDaily, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [loadDaily]);

  // Reset any previously-generated woven reading whenever the user changes lang.
  useEffect(() => {
    setDeepReading(null);
    setDeepError(null);
  }, [lang]);

  const generateDeepDaily = useCallback(async () => {
    setDeepLoading(true);
    setDeepError(null);
    try {
      const hour = new Date().getHours();
      const r = await fetch(`${BACKEND_URL}/api/daily/deep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, hour }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setDeepReading(data.text);
    } catch (e) {
      setDeepError(String(e.message || e));
    } finally {
      setDeepLoading(false);
    }
  }, [lang]);

  // Share today's weave as a testimonial-style Pillow card (reuses existing endpoint).
  const [shareUri, setShareUri] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Reset share state on language change (card labels are lang-scoped).
  useEffect(() => {
    setShareUri(null);
  }, [lang]);

  // Derived display values (hoisted above callbacks that close over them to avoid TDZ)
  const dailyMood = daily ? (lang === 'fr' ? daily.mood_fr : daily.mood_en) : null;
  const dailySign = daily ? SIGNS.find((s) => s.month === daily.month) : null;
  const dailyName = dailySign ? dailySign[lang].name : '';

  const openShareDailyWeave = useCallback(async () => {
    if (!deepReading || !daily) return;
    if (shareUri) {
      setShareOpen(true);
      return;
    }
    setShareLoading(true);
    try {
      const today = daily.date; // YYYY-MM-DD
      // Build a synthetic chart payload from TODAY's values so the testimonial renderer
      // attributes the quote to today's sign rather than a birth chart.
      const body = {
        lang,
        variant: 'testimonial',
        reading_excerpt: deepReading,
        chart: {
          birth_date: today,
          hemisphere: 'N',
          sign_name: dailyName || daily.sign_name,
          sign_archetype: new Date(today + 'T00:00:00').toLocaleString(lang === 'fr' ? 'fr' : 'en', { month: 'long' }),
          elements: daily.elements,
          solar_season: daily.rising?.band === 'dawn' || daily.rising?.band === 'morning' || daily.rising?.band === 'midday' ? 'summer' : 'autumn',
          civic_season: '—',
          cohort_position: '—',
          festival_proximity: '—',
          weather_imprint: '—',
        },
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
      setShareUri(uri);
      setShareOpen(true);
    } catch {
      /* user-facing error already reflected by deepError if any */
    } finally {
      setShareLoading(false);
    }
  }, [deepReading, daily, dailyName, lang, shareUri]);

  const handleDownloadShare = useCallback(async () => {
    if (!shareUri) return;
    if (Platform.OS === 'web') {
      const a = document.createElement('a');
      a.href = shareUri;
      a.download = `gaia-today-weave.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      try {
        await Share.share({
          url: shareUri,
          message: lang === 'fr' ? 'La lecture GAIA du jour' : "Today's GAIA weave",
        });
      } catch {
        /* cancelled */
      }
    }
  }, [shareUri, lang]);

  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="home-scroll"
        >
          <View style={styles.topBar}>
            <View>
              <Text style={styles.brand}>{t('app_name')}</Text>
              <Text style={styles.tagline}>{t('tagline')}</Text>
            </View>
            <LangToggle />
          </View>

          <Animated.View entering={FadeInDown.duration(700).delay(60)}>
            <Heading level={1}>{t('intro_title')}</Heading>
            <View style={{ height: 14 }} />
            <BodyText dim>{t('intro_body')}</BodyText>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(800).delay(200)} style={styles.ctaRow}>
            <TouchableOpacity
              testID="cta-generate-chart"
              style={styles.ctaPrimary}
              activeOpacity={0.8}
              onPress={() => router.push('/chart')}
            >
              <Sparkles size={16} color={COLORS.bg} strokeWidth={2} />
              <Text style={styles.ctaPrimaryText}>{t('cta_generate')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="cta-explore"
              style={styles.ctaGhost}
              activeOpacity={0.7}
              onPress={() => router.push('/signs')}
            >
              <Text style={styles.ctaGhostText}>{t('cta_explore')}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Today's Earth weather — 3 layered rhythms */}
          <Animated.View entering={FadeInDown.duration(700).delay(300)} style={styles.dailyCard} testID="daily-card">
            <View style={styles.dailyHeader}>
              <Sunrise size={16} color={COLORS.gold} strokeWidth={1.4} />
              <Text style={styles.dailyLabel}>{t('daily_title')}</Text>
            </View>
            {loadingDaily ? (
              <ActivityIndicator color={COLORS.gold} />
            ) : daily ? (
              <>
                {/* Layer 1: Calendar sign (month) */}
                <View testID="daily-layer-sign" style={styles.dailyLayer}>
                  <View style={styles.dailyRow}>
                    <CircleDot size={14} color={COLORS.gold} strokeWidth={1.4} />
                    <Text style={styles.dailySubLabel}>{t('signs')}</Text>
                  </View>
                  <Text style={styles.dailySign}>{dailyName}</Text>
                  <View style={styles.chipsRow}>
                    {daily.elements.map((el) => (
                      <Chip key={el} label={el} />
                    ))}
                  </View>
                  <Text style={styles.dailyMood}>{dailyMood}</Text>
                </View>

                {/* Layer 2: Daily rising (hour of day) */}
                {daily.rising ? (
                  <View testID="daily-layer-rising" style={styles.dailyLayer}>
                    <View style={styles.dailyRow}>
                      <Clock size={14} color={COLORS.terracotta} strokeWidth={1.4} />
                      <Text style={[styles.dailySubLabel, { color: COLORS.terracotta }]}>
                        {lang === 'fr' ? 'Lever — ' : 'Rising — '}{daily.rising.label}
                      </Text>
                    </View>
                    <Text style={styles.dailyRisingName}>{daily.rising.name}</Text>
                    <Text style={styles.dailyMood}>{daily.rising.mood}</Text>
                  </View>
                ) : null}

                {/* Layer 3: Lunar phase */}
                {daily.moon ? (
                  <View testID="daily-layer-moon" style={styles.dailyLayer}>
                    <View style={styles.dailyRow}>
                      <Moon size={14} color={COLORS.air} strokeWidth={1.4} />
                      <Text style={[styles.dailySubLabel, { color: COLORS.air }]}>
                        {lang === 'fr' ? 'Lune — ' : 'Moon — '}{daily.moon.label}
                      </Text>
                    </View>
                    <Text style={styles.dailyMoonName}>{daily.moon.name}</Text>
                    <Text style={styles.dailyMood}>{daily.moon.mood}</Text>
                  </View>
                ) : null}

                {/* AI-woven reading CTA */}
                {deepReading ? (
                  <>
                    <View testID="daily-deep-text" style={styles.deepReadingWrap}>
                      {deepReading.split(/\n\n+/).map((para, idx) => (
                        <Text key={idx} style={styles.deepReadingPara}>
                          {para.trim()}
                        </Text>
                      ))}
                    </View>
                    <TouchableOpacity
                      testID="share-daily-weave"
                      style={[styles.weaveBtn, shareLoading && styles.ctaGhost, { marginTop: 4 }]}
                      onPress={openShareDailyWeave}
                      disabled={shareLoading}
                      activeOpacity={0.85}
                    >
                      {shareLoading ? (
                        <>
                          <ActivityIndicator color={COLORS.terracotta} />
                          <Text style={[styles.weaveBtnText, { color: COLORS.terracotta }]}>
                            {lang === 'fr' ? 'Composition du témoignage…' : 'Composing testimonial…'}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Share2 size={14} color={COLORS.terracotta} strokeWidth={1.6} />
                          <Text style={[styles.weaveBtnText, { color: COLORS.terracotta }]}>
                            {lang === 'fr' ? 'Partager la lecture du jour' : 'Share today\'s weave'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    testID="generate-daily-deep"
                    style={[styles.weaveBtn, deepLoading && styles.ctaGhost]}
                    onPress={generateDeepDaily}
                    disabled={deepLoading}
                    activeOpacity={0.85}
                  >
                    {deepLoading ? (
                      <>
                        <ActivityIndicator color={COLORS.gold} />
                        <Text style={styles.weaveBtnText}>
                          {lang === 'fr' ? 'Tissage des trois rythmes…' : 'Weaving the three rhythms…'}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Sparkle size={14} color={COLORS.gold} strokeWidth={1.6} />
                        <Text style={styles.weaveBtnText}>
                          {lang === 'fr' ? 'Tisser la lecture du jour' : 'Weave today\'s reading'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {deepError ? (
                  <Text style={styles.deepErrorText}>{t('error')}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.dailyMood}>{t('error')}</Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(700).delay(400)}>
            <Label>{t('explore')}</Label>
            <QuickLink
              testID="nav-signs"
              icon={CircleDot}
              title={t('signs')}
              subtitle={lang === 'fr' ? 'Douze portes du calendrier' : 'Twelve doors of the calendar'}
              onPress={() => router.push('/signs')}
            />
            <QuickLink
              testID="nav-elements"
              icon={Compass}
              title={t('elements')}
              subtitle={lang === 'fr' ? 'Feu · Eau · Terre · Air · Esprit' : 'Fire · Water · Earth · Air · Spirit'}
              onPress={() => router.push('/elements')}
            />
            <QuickLink
              testID="nav-houses"
              icon={LandPlot}
              title={t('houses')}
              subtitle={lang === 'fr' ? 'Domaines où le calendrier agit' : 'Domains where the calendar acts'}
              onPress={() => router.push('/houses')}
            />
            <QuickLink
              testID="nav-about"
              icon={Info}
              title={t('about')}
              subtitle={t('about_title')}
              onPress={() => router.push('/about')}
            />
          </Animated.View>

          <Text style={styles.disclaimer}>{t('disclaimer')}</Text>
        </ScrollView>

        {/* Share modal for today's weave testimonial */}
        <Modal
          visible={shareOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setShareOpen(false)}
        >
          <View style={styles.modalRoot} testID="daily-share-modal">
            <TouchableOpacity
              testID="close-daily-share"
              style={styles.modalClose}
              onPress={() => setShareOpen(false)}
              accessibilityLabel={t('back')}
            >
              <X size={22} color={COLORS.text} strokeWidth={1.6} />
            </TouchableOpacity>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {shareUri ? (
                <Image
                  source={{ uri: shareUri }}
                  style={styles.dailyCardImage}
                  resizeMode="contain"
                  testID="daily-share-image"
                />
              ) : null}
              <TouchableOpacity
                testID="download-daily-share"
                style={styles.downloadBtn}
                activeOpacity={0.85}
                onPress={handleDownloadShare}
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
                      ? 'Astuce : clic-droit pour copier l\'image.'
                      : 'Astuce : appui long pour enregistrer l\'image.')
                  : (Platform.OS === 'web'
                      ? 'Tip: right-click to copy the image.'
                      : 'Tip: long-press to save the image.')}
              </Text>
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  brand: {
    color: COLORS.gold,
    fontFamily: FONTS.serifBold,
    fontSize: 28,
    letterSpacing: 6,
  },
  tagline: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  ctaRow: {
    marginTop: 28,
    marginBottom: 28,
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  ctaPrimaryText: {
    color: COLORS.bg,
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  ctaGhost: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
  },
  ctaGhostText: {
    color: COLORS.gold,
    fontFamily: FONTS.bodySemi,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dailyCard: {
    backgroundColor: 'rgba(21,25,33,0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
    borderRadius: 18,
    padding: 22,
    marginBottom: 28,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dailyLabel: {
    color: COLORS.gold,
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  dailyLayer: {
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  dailySubLabel: {
    color: COLORS.gold,
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dailySign: {
    color: COLORS.text,
    fontFamily: FONTS.serifBold,
    fontSize: 26,
    marginBottom: 8,
  },
  dailyRisingName: {
    color: COLORS.text,
    fontFamily: FONTS.serifBold,
    fontSize: 20,
    marginBottom: 8,
  },
  dailyMoonName: {
    color: COLORS.text,
    fontFamily: FONTS.serifBold,
    fontSize: 20,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  dailyMood: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  weaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  weaveBtnText: {
    color: COLORS.gold,
    fontFamily: FONTS.bodySemi,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  deepReadingWrap: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  deepReadingPara: {
    color: COLORS.text,
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 23,
    marginBottom: 14,
  },
  deepErrorText: {
    color: COLORS.terracotta,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(212,175,55,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
  },
  linkTitle: {
    color: COLORS.text,
    fontFamily: FONTS.serifBold,
    fontSize: 18,
  },
  linkSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 2,
  },
  disclaimer: {
    color: COLORS.textDim,
    fontFamily: FONTS.body,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
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
  dailyCardImage: {
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
});
