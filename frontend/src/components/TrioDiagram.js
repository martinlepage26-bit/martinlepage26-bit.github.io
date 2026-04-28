import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Line, G } from 'react-native-svg';
import { COLORS, FONTS } from '../theme.js';

/**
 * TrioDiagram — three interconnected gold/terracotta/air circles representing
 * the Sign × Rising × Moon applied to a specific moment (usually birth).
 *
 * Each node has a small label above + a big archetype name below.
 * A thin gold line connects all three to hint at their layered composition.
 */

function Node({ cx, cy, color, label, name, compact }) {
  const r = compact ? 26 : 32;
  return (
    <G>
      <Circle
        cx={cx}
        cy={cy}
        r={r + 6}
        fill="none"
        stroke={color}
        strokeWidth={0.6}
        opacity={0.5}
      />
      <Circle cx={cx} cy={cy} r={r} fill={color} opacity={0.88} />
      <Circle cx={cx} cy={cy} r={r - 4} fill="none" stroke={COLORS.text} strokeWidth={0.8} opacity={0.7} />
    </G>
  );
}

export default function TrioDiagram({
  signColor = COLORS.gold,
  risingColor = COLORS.terracotta,
  moonColor = COLORS.air,
  signName,
  signLabel,
  risingName,
  risingLabel,
  moonName,
  moonLabel,
}) {
  const size = 280;
  // Triangle points: sign on top, rising bottom-left, moon bottom-right.
  const cx = size / 2;
  const top = { x: cx, y: 70 };
  const left = { x: 72, y: 200 };
  const right = { x: size - 72, y: 200 };

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="thread" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={COLORS.gold} stopOpacity="0.15" />
          </LinearGradient>
        </Defs>
        <G>
          <Line x1={top.x} y1={top.y} x2={left.x} y2={left.y} stroke="url(#thread)" strokeWidth={1.2} />
          <Line x1={left.x} y1={left.y} x2={right.x} y2={right.y} stroke="url(#thread)" strokeWidth={1.2} />
          <Line x1={right.x} y1={right.y} x2={top.x} y2={top.y} stroke="url(#thread)" strokeWidth={1.2} />
        </G>
        <Node cx={top.x} cy={top.y} color={signColor} />
        <Node cx={left.x} cy={left.y} color={risingColor} />
        <Node cx={right.x} cy={right.y} color={moonColor} />
      </Svg>

      {/* Labels overlay */}
      <View style={[styles.topLabel]}>
        <Text style={styles.smallLabel}>{signLabel}</Text>
        <Text style={[styles.nodeName, { color: signColor }]}>{signName}</Text>
      </View>
      <View style={[styles.leftLabel]}>
        <Text style={styles.smallLabel}>{risingLabel}</Text>
        <Text style={[styles.nodeName, { color: risingColor }]} numberOfLines={2}>{risingName}</Text>
      </View>
      <View style={[styles.rightLabel]}>
        <Text style={styles.smallLabel}>{moonLabel}</Text>
        <Text style={[styles.nodeName, { color: moonColor }]} numberOfLines={2}>{moonName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: 280,
    height: 320,
    position: 'relative',
  },
  topLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  leftLabel: {
    position: 'absolute',
    top: 242,
    left: 0,
    width: 128,
    alignItems: 'center',
  },
  rightLabel: {
    position: 'absolute',
    top: 242,
    left: 152,
    width: 128,
    alignItems: 'center',
  },
  smallLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  nodeName: {
    fontFamily: FONTS.serifBold,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 4,
  },
});
