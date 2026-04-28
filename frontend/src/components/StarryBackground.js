import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect, G } from 'react-native-svg';
import { COLORS } from '../theme.js';

/**
 * Luminous starry background with warm gold nebula bloom and moss glow.
 * Uses absolute pixel coordinates based on window size so stars
 * always render as small pinpoints regardless of viewport width.
 */

// Deterministic pseudo-random seeds.
const SEEDS = Array.from({ length: 140 }).map((_, i) => {
  const x = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
  const y = Math.abs((Math.sin(i * 78.233) * 12345.6789) % 1);
  const s = Math.abs((Math.sin(i * 4.1414) * 99991.777) % 1);
  const o = Math.abs((Math.sin(i * 33.17) * 5521.3) % 1);
  return { x, y, s, o };
});

export default function StarryBackground({ children, intensity = 1 }) {
  const { width, height } = useWindowDimensions();
  // Cap height for very tall web pages so gradients still read well.
  const h = Math.max(1, Math.min(height || 900, 1400));
  const w = Math.max(1, width || 420);

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <Defs>
            <RadialGradient id="bloom" cx="72%" cy="18%" r="62%">
              <Stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.22 * intensity} />
              <Stop offset="50%" stopColor={COLORS.terracotta} stopOpacity={0.08 * intensity} />
              <Stop offset="100%" stopColor={COLORS.bg} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="moss" cx="14%" cy="92%" r="68%">
              <Stop offset="0%" stopColor={COLORS.moss} stopOpacity={0.18 * intensity} />
              <Stop offset="100%" stopColor={COLORS.bg} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={w} height={h} fill={COLORS.bg} />
          <Rect x={0} y={0} width={w} height={h} fill="url(#bloom)" />
          <Rect x={0} y={0} width={w} height={h} fill="url(#moss)" />
          <G>
            {SEEDS.map((seed, i) => {
              const cx = seed.x * w;
              const cy = seed.y * h;
              // star radius 0.4 .. 1.6 px — always tiny
              const r = 0.4 + seed.s * 1.2;
              const op = 0.25 + seed.o * 0.7;
              return <Circle key={i} cx={cx} cy={cy} r={r} fill={COLORS.text} opacity={op} />;
            })}
          </G>
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    width: '100%',
  },
});
