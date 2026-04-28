import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme.js';

export function SectionCard({ title, children, testID }) {
  return (
    <View testID={testID} style={styles.card}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function Chip({ label, color }) {
  return (
    <View style={[styles.chip, { borderColor: color || COLORS.borderStrong }]}>
      <Text style={[styles.chipText, { color: color || COLORS.gold }]}>{label}</Text>
    </View>
  );
}

export function Pill({ label, active }) {
  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </View>
  );
}

export function Label({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Heading({ children, level = 1 }) {
  const style = level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3;
  return <Text style={style}>{children}</Text>;
}

export function BodyText({ children, dim, style }) {
  return <Text style={[styles.body, dim && styles.bodyDim, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    color: COLORS.gold,
    fontFamily: FONTS.serifBold,
    fontSize: 18,
    letterSpacing: 1,
    marginBottom: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 8,
    marginBottom: 6,
  },
  chipText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  pillActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  pillText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    letterSpacing: 1,
  },
  pillTextActive: {
    color: COLORS.gold,
  },
  label: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  h1: {
    color: COLORS.gold,
    fontFamily: FONTS.serifBold,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: 0.5,
  },
  h2: {
    color: COLORS.text,
    fontFamily: FONTS.serifBold,
    fontSize: 28,
    lineHeight: 34,
  },
  h3: {
    color: COLORS.text,
    fontFamily: FONTS.serif,
    fontSize: 22,
    lineHeight: 30,
  },
  body: {
    color: COLORS.text,
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 24,
  },
  bodyDim: {
    color: COLORS.textMuted,
  },
});
