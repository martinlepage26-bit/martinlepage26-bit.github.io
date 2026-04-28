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
import { ChevronLeft } from 'lucide-react-native';

import StarryBackground from '../src/components/StarryBackground.js';
import LangToggle from '../src/components/LangToggle.js';
import { Heading, BodyText } from '../src/components/UI.js';
import { useLang } from '../src/context/Lang.js';
import { COLORS, FONTS } from '../src/theme.js';
import { HOUSES } from '../src/data/gaia.js';

export default function HousesList() {
  const router = useRouter();
  const { t, lang } = useLang();
  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="houses-scroll"
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="back-houses"
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ChevronLeft size={22} color={COLORS.gold} strokeWidth={1.6} />
            </TouchableOpacity>
            <LangToggle />
          </View>
          <Heading level={1}>{t('houses')}</Heading>
          <View style={{ height: 10 }} />
          <BodyText dim>
            {lang === 'fr'
              ? 'Douze domaines où le calendrier agit sur la vie.'
              : 'Twelve domains where the calendar acts on life.'}
          </BodyText>
          <View style={{ height: 24 }} />
          {HOUSES.map((house, i) => {
            const h = house[lang];
            return (
              <Animated.View
                key={house.id}
                entering={FadeInDown.duration(400).delay(40 * i)}
              >
                <View
                  testID={`house-card-${house.id}`}
                  style={styles.card}
                >
                  <Text style={styles.num}>{String(house.id).padStart(2, '0')}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{h.name}</Text>
                    <Text style={styles.desc}>{h.desc}</Text>
                  </View>
                </View>
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
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  num: {
    color: COLORS.gold,
    fontFamily: FONTS.serifBold,
    fontSize: 24,
    width: 36,
    marginTop: 2,
  },
  name: {
    color: COLORS.text,
    fontFamily: FONTS.serifBold,
    fontSize: 18,
    marginBottom: 4,
  },
  desc: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
