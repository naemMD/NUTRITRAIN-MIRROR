import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  suffix?: string;
}

export default function SimpleBarChart({
  data,
  color = '#3498DB',
  height = 180,
  suffix = '',
}: SimpleBarChartProps) {
  if (!data.length) return null;

  const PADDING_LEFT = 45;
  const PADDING_RIGHT = 15;
  const PADDING_TOP = 15;
  const PADDING_BOTTOM = 30;
  const WIDTH = 320;
  const chartW = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartH = height - PADDING_TOP - PADDING_BOTTOM;

  const maxV = Math.max(...data.map(d => d.value), 1) * 1.15;
  const barW = Math.min(30, (chartW / data.length) * 0.6);
  const gap = chartW / data.length;

  const getY = (v: number) => PADDING_TOP + chartH - (v / maxV) * chartH;

  // Y-axis labels (4 ticks)
  const yTicks = Array.from({ length: 4 }, (_, i) => (maxV * (i + 1)) / 4);

  return (
    <View style={styles.container}>
      <Svg width={WIDTH} height={height} viewBox={`0 0 ${WIDTH} ${height}`}>
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <React.Fragment key={i}>
            <Line x1={PADDING_LEFT} y1={getY(tick)} x2={WIDTH - PADDING_RIGHT} y2={getY(tick)} stroke="#2A3445" strokeWidth={1} />
            <SvgText x={PADDING_LEFT - 6} y={getY(tick) + 4} fill="#666" fontSize={10} textAnchor="end">
              {Math.round(tick)}{suffix}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Baseline */}
        <Line x1={PADDING_LEFT} y1={PADDING_TOP + chartH} x2={WIDTH - PADDING_RIGHT} y2={PADDING_TOP + chartH} stroke="#2A3445" strokeWidth={1} />

        {/* Bars */}
        {data.map((d, i) => {
          const cx = PADDING_LEFT + gap * i + gap / 2;
          const barH = (d.value / maxV) * chartH;
          return (
            <React.Fragment key={i}>
              <Rect
                x={cx - barW / 2}
                y={PADDING_TOP + chartH - barH}
                width={barW}
                height={barH}
                rx={4}
                fill={color}
                opacity={0.85}
              />
              {/* Value on top */}
              <SvgText x={cx} y={PADDING_TOP + chartH - barH - 5} fill="#ccc" fontSize={9} textAnchor="middle">
                {Math.round(d.value)}{suffix}
              </SvgText>
              {/* X label */}
              <SvgText x={cx} y={height - 6} fill="#666" fontSize={9} textAnchor="middle">
                {d.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
});
