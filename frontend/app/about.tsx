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
import { Heading, BodyText, SectionCard } from '../src/components/UI.js';
import { useLang } from '../src/context/Lang.js';
import { COLORS, FONTS } from '../src/theme.js';

export default function About() {
  const router = useRouter();
  const { t } = useLang();
  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="about-scroll"
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="back-about"
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ChevronLeft size={22} color={COLORS.gold} strokeWidth={1.6} />
            </TouchableOpacity>
            <LangToggle />
          </View>

          <Animated.View entering={FadeInDown.duration(600)}>
            <Heading level={1}>{t('about_title')}</Heading>
            <View style={{ height: 10 }} />
            <BodyText dim>{t('tagline')}</BodyText>
          </Animated.View>

          <View style={{ height: 26 }} />

          <Animated.View entering={FadeInDown.duration(600).delay(120)}>
            <SectionCard>
              <BodyText>{t('about_body_1')}</BodyText>
            </SectionCard>
            <SectionCard>
              <BodyText>{t('about_body_2')}</BodyText>
            </SectionCard>
            <SectionCard>
              <BodyText style={{ fontStyle: 'italic' }}>{t('about_body_3')}</BodyText>
            </SectionCard>
          </Animated.View>

          <Text style={styles.disclaimer}>{t('disclaimer')}</Text>
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
  disclaimer: {
    color: COLORS.textDim,
    fontFamily: FONTS.body,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
