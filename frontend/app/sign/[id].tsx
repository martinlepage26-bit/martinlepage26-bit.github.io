import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronLeft } from 'lucide-react-native';

import StarryBackground from '../../src/components/StarryBackground.js';
import LangToggle from '../../src/components/LangToggle.js';
import ElementWheel from '../../src/components/ElementWheel.js';
import { BodyText, Chip, SectionCard, Label } from '../../src/components/UI.js';
import { useLang } from '../../src/context/Lang.js';
import { COLORS, FONTS, ELEMENT_COLORS } from '../../src/theme.js';
import { SIGNS } from '../../src/data/gaia.js';

export default function SignDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t, lang } = useLang();

  const sign = SIGNS.find((s) => s.id === id);
  if (!sign) {
    return (
      <StarryBackground>
        <SafeAreaView style={{ flex: 1, padding: 24 }}>
          <BodyText>{t('error')}</BodyText>
        </SafeAreaView>
      </StarryBackground>
    );
  }

  const s = sign[lang];

  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID={`sign-detail-${sign.id}`}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="back-sign"
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ChevronLeft size={22} color={COLORS.gold} strokeWidth={1.6} />
            </TouchableOpacity>
            <LangToggle />
          </View>

          <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center' }}>
            <Text style={styles.subtitle}>{s.subtitle}</Text>
            <Text style={styles.name}>{s.name}</Text>
            <View style={styles.chipsRow}>
              {sign.elements.map((el) => (
                <Chip key={el} label={el} color={ELEMENT_COLORS[el]} />
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(800).delay(200)} style={styles.wheelWrap}>
            <ElementWheel activeElements={sign.elements} size={240} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(700).delay(300)}>
            <SectionCard title={t('imprint').toUpperCase()}>
              <BodyText>{s.opening}</BodyText>
            </SectionCard>
            <SectionCard title={t('themes').toUpperCase()}>
              <BodyText>{s.themes}</BodyText>
            </SectionCard>
            <SectionCard title={t('imprint').toUpperCase()}>
              <BodyText>{s.imprint}</BodyText>
            </SectionCard>
            <SectionCard title={t('shadow').toUpperCase()}>
              <BodyText>{s.shadow}</BodyText>
            </SectionCard>
            <SectionCard title={t('ritual').toUpperCase()}>
              <BodyText style={{ fontStyle: 'italic' }}>{s.ritual}</BodyText>
            </SectionCard>
          </Animated.View>
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
    marginBottom: 18,
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
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  name: {
    color: COLORS.gold,
    fontFamily: FONTS.serifBold,
    fontSize: 36,
    textAlign: 'center',
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 14,
  },
  wheelWrap: {
    alignItems: 'center',
    marginVertical: 26,
  },
});
