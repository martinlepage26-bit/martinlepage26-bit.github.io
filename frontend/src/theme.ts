import { Platform } from 'react-native';

export const colors = {
  bg: '#0A0A0E',
  surface: '#111116',
  surfaceElevated: '#16161D',
  panel: '#0E0E13',
  border: '#1E1E26',
  borderStrong: '#2B2B36',
  borderDashed: '#2B2B36',

  textPrimary: '#E6E8EC',
  textSecondary: '#9AA0AC',
  textMuted: '#6B7080',
  textFaint: '#4A4F5C',

  amber: '#F5B841',
  amberDim: 'rgba(245, 184, 65, 0.14)',
  amberFaint: 'rgba(245, 184, 65, 0.06)',
  emerald: '#4ADE80',
  red: '#EF4444',
  redDim: 'rgba(239, 68, 68, 0.14)',
};

export const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
}) as string;

export const sans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
}) as string;

export const type = {
  h1: { fontSize: 26, letterSpacing: -0.8, fontFamily: mono, color: colors.textPrimary, fontWeight: '600' as const },
  h2: { fontSize: 18, letterSpacing: -0.4, fontFamily: mono, color: colors.textPrimary, fontWeight: '600' as const },
  body: { fontSize: 15.5, lineHeight: 24, fontFamily: sans, color: colors.textPrimary },
  bodyMuted: { fontSize: 14, lineHeight: 22, fontFamily: sans, color: colors.textSecondary },
  caption: { fontSize: 10.5, letterSpacing: 2.4, fontFamily: mono, color: colors.textMuted, textTransform: 'uppercase' as const },
  console: { fontSize: 13, fontFamily: mono, color: colors.amber },
  label: { fontSize: 11, letterSpacing: 1.8, fontFamily: mono, color: colors.textSecondary, textTransform: 'uppercase' as const },
};

export const radii = {
  none: 0,
  sm: 2,
  md: 4,
};

export const spacing = (n: number) => n * 4;
