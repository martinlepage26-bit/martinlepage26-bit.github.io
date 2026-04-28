import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import StarryBackground from '../src/components/StarryBackground.js';
import LangToggle from '../src/components/LangToggle.js';
import { Heading, BodyText, Chip } from '../src/components/UI.js';
import { useLang } from '../src/context/Lang.js';
import { COLORS, FONTS, ELEMENT_COLORS } from '../src/theme.js';
import { SIGNS } from '../src/data/gaia.js';

export default function SignsList() {
  const router = useRouter();
  const { t, lang } = useLang();

  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="signs-scroll"
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="back-signs"
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityLabel={t('back')}
            >
              <ChevronLeft size={22} color={COLORS.gold} strokeWidth={1.6} />
            </TouchableOpacity>
            <LangToggle />
          </View>

          <Heading level={1}>{t('signs')}</Heading>
          <View style={{ height: 8 }} />
          <BodyText dim>
            {lang === 'fr'
              ? 'Douze archétypes mensuels de l\'astrologie du calendrier terrestre.'
              : 'Twelve monthly archetypes of Earth-calendar astrology.'}
          </BodyText>

          <View style={{ height: 24 }} />
          {SIGNS.map((sign, i) => {
            const s = sign[lang];
            return (
              <Animated.View key={sign.id} entering={FadeInDown.duration(500).delay(60 * i)}>
                <TouchableOpacity
                  testID={`sign-card-${sign.id}`}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/sign/${sign.id}`)}
                  style={styles.card}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardMonth}>{s.subtitle}</Text>
                    <Text style={styles.cardName}>{s.name}</Text>
                    <View style={styles.cardChips}>
                      {sign.elements.map((el) => (
                        <Chip key={el} label={el} color={ELEMENT_COLORS[el]} />
                      ))}
                    </View>
                    <Text style={styles.cardBody} numberOfLines={2}>
                      {s.opening}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.textMuted} strokeWidth={1.4} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 60 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    gap: 10,
  },
  cardMonth: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardName: {
    color: COLORS.text,
    fontFamily: FONTS.serifBold,
    fontSize: 22,
    marginBottom: 8,
  },
  cardChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  cardBody: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
