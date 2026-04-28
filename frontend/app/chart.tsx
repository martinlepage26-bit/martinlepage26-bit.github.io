import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Sparkles } from 'lucide-react-native';

import StarryBackground from '../src/components/StarryBackground.js';
import LangToggle from '../src/components/LangToggle.js';
import { Heading, BodyText, Label, Pill } from '../src/components/UI.js';
import { useLang } from '../src/context/Lang.js';
import { COLORS, FONTS } from '../src/theme.js';
import { buildChart } from '../src/lib/chart.js';

export default function ChartGenerator() {
  const router = useRouter();
  const { t, lang } = useLang();

  const today = new Date();
  const [year, setYear] = useState(String(today.getFullYear() - 25));
  const [month, setMonth] = useState('6');
  const [day, setDay] = useState('21');
  const [birthHour, setBirthHour] = useState('');
  const [place, setPlace] = useState('');
  const [hemisphere, setHemisphere] = useState('N');
  const [cutoffMonth, setCutoffMonth] = useState('');
  const [cutoffDay, setCutoffDay] = useState('');
  const [loading, setLoading] = useState(false);

  const valid = useMemo(() => {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    if (!y || y < 1900 || y > 2099) return false;
    if (!m || m < 1 || m > 12) return false;
    if (!d || d < 1 || d > 31) return false;
    const dt = new Date(y, m - 1, d);
    if (dt.getMonth() + 1 !== m || dt.getDate() !== d) return false;
    return true;
  }, [year, month, day]);

  const submit = () => {
    if (!valid) {
      Alert.alert(
        lang === 'fr' ? 'Date invalide' : 'Invalid date',
        lang === 'fr'
          ? 'Vérifie l\'année, le mois et le jour.'
          : 'Please check year, month and day.',
      );
      return;
    }
    setLoading(true);
    try {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      const d = parseInt(day, 10);
      const cm = cutoffMonth ? parseInt(cutoffMonth, 10) : null;
      const cd = cutoffDay ? parseInt(cutoffDay, 10) : null;
      const bh = birthHour.trim() === '' ? null : parseInt(birthHour, 10);
      const birthHourValid = bh !== null && bh >= 0 && bh <= 23 ? bh : null;
      const chart = buildChart({
        date: new Date(y, m - 1, d).toISOString(),
        hemisphere,
        cutoffMonth: cm && cm >= 1 && cm <= 12 ? cm : null,
        cutoffDay: cd && cd >= 1 && cd <= 31 ? cd : null,
        place: place.trim(),
        lang,
      });
      router.push({
        pathname: '/result',
        params: {
          chart: JSON.stringify(chart),
          ...(birthHourValid !== null ? { birth_hour: String(birthHourValid) } : {}),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            testID="chart-form-scroll"
          >
            <View style={styles.topBar}>
              <TouchableOpacity
                testID="back-home"
                onPress={() => router.back()}
                style={styles.backBtn}
                accessibilityLabel={t('back')}
              >
                <ChevronLeft size={22} color={COLORS.gold} strokeWidth={1.6} />
              </TouchableOpacity>
              <LangToggle />
            </View>

            <Animated.View entering={FadeInDown.duration(600)}>
              <Heading level={1}>{t('cta_generate')}</Heading>
              <View style={{ height: 10 }} />
              <BodyText dim>
                {lang === 'fr'
                  ? 'Entre ta date de naissance. Le système ne demande pas d\'heure : il lit des rythmes saisonniers, pas des planètes.'
                  : 'Enter your birth date. The system does not ask for the hour — it reads seasonal rhythms, not planets.'}
              </BodyText>
            </Animated.View>

            <View style={{ height: 28 }} />

            {/* Birth date */}
            <Label>{t('birth_date')}</Label>
            <View style={styles.dateRow}>
              <View style={[styles.input, { flex: 1 }]}>
                <Text style={styles.inputLabel}>{lang === 'fr' ? 'Année' : 'Year'}</Text>
                <TextInput
                  testID="input-year"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="1999"
                  placeholderTextColor={COLORS.textDim}
                  style={styles.inputText}
                />
              </View>
              <View style={[styles.input, { width: 90 }]}>
                <Text style={styles.inputLabel}>{t('month')}</Text>
                <TextInput
                  testID="input-month"
                  value={month}
                  onChangeText={setMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="06"
                  placeholderTextColor={COLORS.textDim}
                  style={styles.inputText}
                />
              </View>
              <View style={[styles.input, { width: 90 }]}>
                <Text style={styles.inputLabel}>{t('day')}</Text>
                <TextInput
                  testID="input-day"
                  value={day}
                  onChangeText={setDay}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="21"
                  placeholderTextColor={COLORS.textDim}
                  style={styles.inputText}
                />
              </View>
            </View>

            {/* Place */}
            <View style={{ height: 20 }} />
            <Label>{t('birth_place')}</Label>
            <View style={styles.input}>
              <TextInput
                testID="input-place"
                value={place}
                onChangeText={setPlace}
                placeholder={lang === 'fr' ? 'Montréal, Québec' : 'Montréal, Québec'}
                placeholderTextColor={COLORS.textDim}
                style={[styles.inputText, { paddingTop: 0, paddingBottom: 0 }]}
              />
            </View>

            {/* Birth hour (optional) — unlocks Rising × Moon × Sign trio on /result */}
            <View style={{ height: 22 }} />
            <Label>
              {lang === 'fr' ? 'Heure de naissance (optionnelle)' : 'Birth hour (optional)'}
            </Label>
            <View style={styles.dateRow}>
              <View style={[styles.input, { width: 130 }]}>
                <Text style={styles.inputLabel}>{lang === 'fr' ? 'Heure 0–23' : 'Hour 0–23'}</Text>
                <TextInput
                  testID="input-birth-hour"
                  value={birthHour}
                  onChangeText={setBirthHour}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="14"
                  placeholderTextColor={COLORS.textDim}
                  style={styles.inputText}
                />
              </View>
            </View>
            <Text style={styles.hint}>
              {lang === 'fr'
                ? 'Active le trio Signe × Rising × Lune dans ta charte. Laisse vide si tu ne sais pas.'
                : 'Unlocks the Sign × Rising × Moon trio on your chart. Leave empty if unknown.'}
            </Text>

            {/* Hemisphere */}
            <View style={{ height: 22 }} />
            <Label>{t('hemisphere')}</Label>
            <View style={styles.pillRow}>
              <TouchableOpacity
                testID="hemisphere-N"
                onPress={() => setHemisphere('N')}
                activeOpacity={0.7}
              >
                <Pill label={t('north')} active={hemisphere === 'N'} />
              </TouchableOpacity>
              <TouchableOpacity
                testID="hemisphere-S"
                onPress={() => setHemisphere('S')}
                activeOpacity={0.7}
              >
                <Pill label={t('south')} active={hemisphere === 'S'} />
              </TouchableOpacity>
            </View>

            {/* School cutoff */}
            <View style={{ height: 22 }} />
            <Label>{t('school_cutoff')}</Label>
            <View style={styles.dateRow}>
              <View style={[styles.input, { width: 110 }]}>
                <Text style={styles.inputLabel}>{t('month')}</Text>
                <TextInput
                  testID="input-cutoff-month"
                  value={cutoffMonth}
                  onChangeText={setCutoffMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="09"
                  placeholderTextColor={COLORS.textDim}
                  style={styles.inputText}
                />
              </View>
              <View style={[styles.input, { width: 110 }]}>
                <Text style={styles.inputLabel}>{t('day')}</Text>
                <TextInput
                  testID="input-cutoff-day"
                  value={cutoffDay}
                  onChangeText={setCutoffDay}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="01"
                  placeholderTextColor={COLORS.textDim}
                  style={styles.inputText}
                />
              </View>
            </View>
            <Text style={styles.hint}>
              {lang === 'fr'
                ? 'Ex. 09/01 = rentrée au 1er septembre. Laisse vide si inconnu.'
                : 'E.g. 09/01 = September 1st cutoff. Leave blank if unknown.'}
            </Text>

            {/* Submit */}
            <View style={{ height: 36 }} />
            <TouchableOpacity
              testID="submit-chart"
              activeOpacity={0.85}
              onPress={submit}
              disabled={loading}
              style={[styles.submit, !valid && styles.submitDisabled]}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.bg} />
              ) : (
                <>
                  <Sparkles size={16} color={COLORS.bg} strokeWidth={2} />
                  <Text style={styles.submitText}>{t('generate_chart')}</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 60,
  },
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
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  inputLabel: {
    color: COLORS.textDim,
    fontFamily: FONTS.body,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  inputText: {
    color: COLORS.text,
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    paddingVertical: 6,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  hint: {
    color: COLORS.textDim,
    fontFamily: FONTS.body,
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  submit: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: COLORS.bg,
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
