import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  size?: number;
}

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quadriceps: 'Quads',
  hamstrings: 'Hams',
  calves: 'Calves',
  abs: 'Abs',
  glutes: 'Glutes',
  forearms: 'Forearms',
  other: 'Other',
};

export function formatMuscleLabel(key: string): string {
  return MUSCLE_LABELS[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
}

// Round percentages so they always sum to exactly 100
function roundPercentages(fractions: number[]): number[] {
  const rawPcts = fractions.map(f => f * 100);
  const floored = rawPcts.map(p => Math.floor(p));
  let remainder = 100 - floored.reduce((a, b) => a + b, 0);
  const decimals = rawPcts.map((p, i) => ({ i, dec: p - floored[i] }));
  decimals.sort((a, b) => b.dec - a.dec);
  for (let j = 0; j < remainder; j++) {
    floored[decimals[j].i] += 1;
  }
  return floored;
}

export default function DonutChart({ segments, size = 130 }: DonutChartProps) {
  const filtered = segments.filter(s => s.value > 0);
  if (!filtered.length) return null;

  const total = filtered.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.55;

  const fractions = filtered.map(s => s.value / total);
  const pcts = roundPercentages(fractions);

  let startAngle = -Math.PI / 2;

  const arcs = filtered.map((seg, i) => {
    const sweep = fractions[i] * 2 * Math.PI;
    const endAngle = startAngle + sweep;

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);

    const large = sweep > Math.PI ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    startAngle = endAngle;
    return { ...seg, d, pct: pcts[i] };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <Path key={i} d={arc.d} fill={arc.color} />
        ))}
      </Svg>
      <View style={styles.legend}>
        {arcs.map((arc, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: arc.color }]} />
            <Text style={styles.legendLabel}>{arc.label}</Text>
            <Text style={styles.legendValue}>{arc.pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: '#aaa', fontSize: 10 },
  legendValue: { color: '#ccc', fontSize: 10, fontWeight: 'bold' },
});
