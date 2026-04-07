import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';

interface DataPoint {
  label: string;
  value1: number;
  value2: number;
}

interface GroupedBarChartProps {
  data: DataPoint[];
  color1?: string;
  color2?: string;
  label1?: string;
  label2?: string;
  height?: number;
}

export default function GroupedBarChart({
  data,
  color1 = '#3498DB',
  color2 = '#2ecc71',
  label1 = 'Planned',
  label2 = 'Completed',
  height = 180,
}: GroupedBarChartProps) {
  if (!data.length) return null;

  const PADDING_LEFT = 30;
  const PADDING_RIGHT = 15;
  const PADDING_TOP = 15;
  const PADDING_BOTTOM = 30;
  const LEGEND_H = 25;
  const totalH = height + LEGEND_H;
  const WIDTH = 320;
  const chartW = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartH = height - PADDING_TOP - PADDING_BOTTOM;

  const maxV = Math.max(...data.flatMap(d => [d.value1, d.value2]), 1);
  const gap = chartW / data.length;
  const barW = Math.min(12, gap * 0.3);

  const getY = (v: number) => PADDING_TOP + chartH - (v / maxV) * chartH;

  return (
    <View style={styles.container}>
      <Svg width={WIDTH} height={totalH} viewBox={`0 0 ${WIDTH} ${totalH}`}>
        {/* Grid lines */}
        {Array.from({ length: maxV }, (_, i) => i + 1).slice(0, 5).map((tick, i) => (
          <React.Fragment key={i}>
            <Line x1={PADDING_LEFT} y1={getY(tick)} x2={WIDTH - PADDING_RIGHT} y2={getY(tick)} stroke="#2A3445" strokeWidth={1} />
            <SvgText x={PADDING_LEFT - 6} y={getY(tick) + 4} fill="#666" fontSize={10} textAnchor="end">
              {tick}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Baseline */}
        <Line x1={PADDING_LEFT} y1={PADDING_TOP + chartH} x2={WIDTH - PADDING_RIGHT} y2={PADDING_TOP + chartH} stroke="#2A3445" strokeWidth={1} />

        {/* Grouped bars */}
        {data.map((d, i) => {
          const cx = PADDING_LEFT + gap * i + gap / 2;
          const h1 = (d.value1 / maxV) * chartH;
          const h2 = (d.value2 / maxV) * chartH;
          return (
            <React.Fragment key={i}>
              <Rect
                x={cx - barW - 1}
                y={PADDING_TOP + chartH - h1}
                width={barW}
                height={h1}
                rx={3}
                fill={color1}
                opacity={0.4}
              />
              <Rect
                x={cx + 1}
                y={PADDING_TOP + chartH - h2}
                width={barW}
                height={h2}
                rx={3}
                fill={color2}
                opacity={0.9}
              />
              <SvgText x={cx} y={height - 6} fill="#666" fontSize={9} textAnchor="middle">
                {d.label}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Legend */}
        <Rect x={WIDTH / 2 - 90} y={height + 5} width={10} height={10} rx={2} fill={color1} opacity={0.4} />
        <SvgText x={WIDTH / 2 - 75} y={height + 14} fill="#888" fontSize={10}>{label1}</SvgText>
        <Rect x={WIDTH / 2 + 10} y={height + 5} width={10} height={10} rx={2} fill={color2} opacity={0.9} />
        <SvgText x={WIDTH / 2 + 25} y={height + 14} fill="#888" fontSize={10}>{label2}</SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
});
