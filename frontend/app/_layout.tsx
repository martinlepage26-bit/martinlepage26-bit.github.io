import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  CormorantGaramond_500Medium,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
} from '@expo-google-fonts/manrope';
import { LangProvider } from '../src/context/Lang.js';
import { COLORS } from '../src/theme.js';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded) {
      try { await SplashScreen.hideAsync(); } catch {}
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <LangProvider>
      <View onLayout={onLayout} style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.bg },
            animation: 'fade',
          }}
        />
      </View>
    </LangProvider>
  );
}
