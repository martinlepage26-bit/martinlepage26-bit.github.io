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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft } from 'lucide-react-native';

import StarryBackground from '../../src/components/StarryBackground.js';
import LangToggle from '../../src/components/LangToggle.js';
import { BodyText, SectionCard } from '../../src/components/UI.js';
import { useLang } from '../../src/context/Lang.js';
import { COLORS, FONTS } from '../../src/theme.js';
import { ELEMENTS } from '../../src/data/gaia.js';

export default function ElementDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t, lang } = useLang();
  const el = ELEMENTS.find((e) => e.id === id);
  if (!el) {
    return (
      <StarryBackground>
        <SafeAreaView style={{ flex: 1, padding: 24 }}>
          <BodyText>{t('error')}</BodyText>
        </SafeAreaView>
      </StarryBackground>
    );
  }
  const e = el[lang];
  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID={`element-detail-${el.id}`}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="back-element"
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ChevronLeft size={22} color={COLORS.gold} strokeWidth={1.6} />
            </TouchableOpacity>
            <LangToggle />
          </View>
          <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center' }}>
            <View style={[styles.badge, { backgroundColor: el.color + '22', borderColor: el.color }]}>
              <View style={[styles.dot, { backgroundColor: el.color }]} />
            </View>
            <Text style={[styles.name, { color: el.color }]}>{e.name}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(150)}>
            <SectionCard title={t('natural_form').toUpperCase()}>
              <BodyText>{e.natural}</BodyText>
            </SectionCard>
            <SectionCard title={t('civic_form').toUpperCase()}>
              <BodyText>{e.civic}</BodyText>
            </SectionCard>
            <SectionCard title={t('psyche_form').toUpperCase()}>
              <BodyText>{e.psyche}</BodyText>
            </SectionCard>
            <SectionCard title={t('shadow').toUpperCase()}>
              <BodyText>{e.shadow}</BodyText>
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
  badge: {
    width: 84,
    height: 84,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 999,
  },
  name: {
    fontFamily: FONTS.serifBold,
    fontSize: 38,
    marginBottom: 24,
    textAlign: 'center',
  },
});
