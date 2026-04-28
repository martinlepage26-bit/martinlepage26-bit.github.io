import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Compass, Sparkles, BookOpen, LandPlot, CircleDot, Info, Sunrise } from 'lucide-react-native';

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

  const loadDaily = useCallback(async () => {
    setLoadingDaily(true);
    try {
      const r = await fetch(`${BACKEND_URL}/api/daily`);
      const data = await r.json();
      setDaily(data);
    } catch {
      setDaily(null);
    } finally {
      setLoadingDaily(false);
    }
  }, []);

  useEffect(() => {
    loadDaily();
  }, [loadDaily]);

  const dailyMood = daily ? (lang === 'fr' ? daily.mood_fr : daily.mood_en) : null;
  const dailySign = daily ? SIGNS.find((s) => s.month === daily.month) : null;
  const dailyName = dailySign ? dailySign[lang].name : '';

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

          {/* Today's Earth weather */}
          <Animated.View entering={FadeInDown.duration(700).delay(300)} style={styles.dailyCard} testID="daily-card">
            <View style={styles.dailyHeader}>
              <Sunrise size={16} color={COLORS.gold} strokeWidth={1.4} />
              <Text style={styles.dailyLabel}>{t('daily_title')}</Text>
            </View>
            {loadingDaily ? (
              <ActivityIndicator color={COLORS.gold} />
            ) : daily ? (
              <>
                <Text style={styles.dailySign}>{dailyName}</Text>
                <View style={styles.chipsRow}>
                  {daily.elements.map((el) => (
                    <Chip key={el} label={el} />
                  ))}
                </View>
                <Text style={styles.dailyMood}>{dailyMood}</Text>
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
  dailySign: {
    color: COLORS.text,
    fontFamily: FONTS.serifBold,
    fontSize: 26,
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
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
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
});
