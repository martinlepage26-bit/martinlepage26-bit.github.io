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
import { Heading, BodyText } from '../src/components/UI.js';
import { useLang } from '../src/context/Lang.js';
import { COLORS, FONTS } from '../src/theme.js';
import { ELEMENTS } from '../src/data/gaia.js';

export default function ElementsList() {
  const router = useRouter();
  const { t, lang } = useLang();

  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="elements-scroll"
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="back-elements"
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ChevronLeft size={22} color={COLORS.gold} strokeWidth={1.6} />
            </TouchableOpacity>
            <LangToggle />
          </View>
          <Heading level={1}>{t('elements')}</Heading>
          <View style={{ height: 10 }} />
          <BodyText dim>
            {lang === 'fr'
              ? 'Cinq forces qui traversent la nature, la cité et la psyché.'
              : 'Five forces crossing nature, civic life, and psyche.'}
          </BodyText>
          <View style={{ height: 24 }} />
          {ELEMENTS.map((el, i) => {
            const e = el[lang];
            return (
              <Animated.View key={el.id} entering={FadeInDown.duration(500).delay(80 * i)}>
                <TouchableOpacity
                  testID={`element-card-${el.id}`}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/element/${el.id}`)}
                  style={[styles.card, { borderColor: el.color + '55' }]}
                >
                  <View style={[styles.dot, { backgroundColor: el.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: el.color }]}>{e.name}</Text>
                    <Text style={styles.tag} numberOfLines={2}>
                      {e.natural}
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
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    gap: 14,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 999,
  },
  name: {
    fontFamily: FONTS.serifBold,
    fontSize: 22,
    marginBottom: 4,
  },
  tag: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
