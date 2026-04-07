import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface HorizontalDistributionProps {
  segments: Segment[];
  height?: number;
}

export default function HorizontalDistribution({ segments, height = 28 }: HorizontalDistributionProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  return (
    <View>
      <View style={[styles.bar, { height }]}>
        {segments.map((seg, i) => {
          const pct = (seg.value / total) * 100;
          if (pct === 0) return null;
          return (
            <View
              key={i}
              style={{
                width: `${pct}%` as any,
                backgroundColor: seg.color,
                height: '100%',
                borderTopLeftRadius: i === 0 ? 8 : 0,
                borderBottomLeftRadius: i === 0 ? 8 : 0,
                borderTopRightRadius: i === segments.length - 1 ? 8 : 0,
                borderBottomRightRadius: i === segments.length - 1 ? 8 : 0,
              }}
            />
          );
        })}
      </View>
      <View style={styles.legend}>
        {segments.map((seg, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <Text style={styles.legendLabel}>{seg.label}</Text>
            <Text style={styles.legendValue}>{seg.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: '#aaa', fontSize: 11 },
  legendValue: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});
