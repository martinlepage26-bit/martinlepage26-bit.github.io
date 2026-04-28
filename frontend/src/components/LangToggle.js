import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLang } from '../context/Lang.js';
import { COLORS, FONTS } from '../theme.js';

export default function LangToggle({ style }) {
  const { lang, toggle } = useLang();
  return (
    <TouchableOpacity
      testID="language-toggle"
      accessibilityLabel="Toggle language"
      onPress={toggle}
      style={[styles.btn, style]}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, lang === 'en' && styles.active]}>EN</Text>
      <Text style={styles.sep}>·</Text>
      <Text style={[styles.label, lang === 'fr' && styles.active]}>FR</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: FONTS.bodyMedium,
  },
  active: {
    color: COLORS.gold,
  },
  sep: {
    color: COLORS.border,
    marginHorizontal: 6,
  },
});
