import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G, Line, Text as SvgText } from 'react-native-svg';
import { COLORS, ELEMENT_COLORS, FONTS } from '../theme.js';

/**
 * ElementWheel — a 5-segment celestial wheel highlighting the chart's active elements.
 */
export default function ElementWheel({ activeElements = [], size = 260 }) {
  const center = size / 2;
  const radius = size * 0.42;
  const innerRadius = size * 0.28;
  const elements = ['Fire', 'Water', 'Earth', 'Air', 'Spirit'];
  const labelsFr = { Fire: 'Feu', Water: 'Eau', Earth: 'Terre', Air: 'Air', Spirit: 'Esprit' };

  // Normalize activeElements (accept English or French).
  const active = new Set(
    activeElements.map((e) => {
      if (['Fire', 'Water', 'Earth', 'Air', 'Spirit'].includes(e)) return e;
      const frMap = { Feu: 'Fire', Eau: 'Water', Terre: 'Earth', Air: 'Air', Esprit: 'Spirit' };
      return frMap[e] || e;
    }),
  );

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={COLORS.gold} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        {/* Outer ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#ring)"
          strokeWidth={1.2}
          fill="none"
        />
        {/* Inner ring */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke={COLORS.border}
          strokeWidth={1}
          fill="none"
        />

        {/* 5 element nodes */}
        <G>
          {elements.map((el, i) => {
            const angle = (i / elements.length) * Math.PI * 2 - Math.PI / 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            const isActive = active.has(el);
            const c = ELEMENT_COLORS[el];
            // Radial line from inner to outer
            const ix = center + Math.cos(angle) * innerRadius;
            const iy = center + Math.sin(angle) * innerRadius;
            return (
              <G key={el}>
                <Line
                  x1={ix}
                  y1={iy}
                  x2={x}
                  y2={y}
                  stroke={isActive ? c : COLORS.border}
                  strokeWidth={isActive ? 1.6 : 0.6}
                  opacity={isActive ? 0.9 : 0.5}
                />
                <Circle
                  cx={x}
                  cy={y}
                  r={isActive ? 9 : 4.5}
                  fill={isActive ? c : COLORS.surfaceAlt}
                  stroke={isActive ? COLORS.text : COLORS.border}
                  strokeWidth={isActive ? 1.2 : 0.8}
                />
                <SvgText
                  x={center + Math.cos(angle) * (radius + 18)}
                  y={center + Math.sin(angle) * (radius + 18) + 4}
                  fill={isActive ? COLORS.text : COLORS.textMuted}
                  fontSize="11"
                  fontFamily={FONTS.bodySemi}
                  fontWeight="600"
                  textAnchor="middle"
                  opacity={isActive ? 1 : 0.7}
                >
                  {el.toUpperCase()}
                </SvgText>
              </G>
            );
          })}
        </G>

        {/* Center gold orb */}
        <Circle cx={center} cy={center} r={size * 0.06} fill={COLORS.gold} opacity={0.9} />
        <Circle cx={center} cy={center} r={size * 0.1} fill="none" stroke={COLORS.gold} strokeWidth={0.4} opacity={0.45} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
