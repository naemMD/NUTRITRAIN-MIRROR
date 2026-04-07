import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  color?: string;
  goalValue?: number;
  goalColor?: string;
  goalLabel?: string;
  height?: number;
  suffix?: string;
}

export default function SimpleLineChart({
  data,
  color = '#2ecc71',
  goalValue,
  goalColor = '#e74c3c',
  goalLabel,
  height = 180,
  suffix = '',
}: SimpleLineChartProps) {
  if (!data.length) return null;

  const PADDING_LEFT = 45;
  const PADDING_RIGHT = 15;
  const PADDING_TOP = 20;
  const PADDING_BOTTOM = 30;
  const WIDTH = 320;
  const chartW = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartH = height - PADDING_TOP - PADDING_BOTTOM;

  const values = data.map(d => d.value);
  const allValues = goalValue != null ? [...values, goalValue] : values;
  const minV = Math.min(...allValues) * 0.9;
  const maxV = Math.max(...allValues) * 1.1;
  const range = maxV - minV || 1;

  const getX = (i: number) => PADDING_LEFT + (i / Math.max(data.length - 1, 1)) * chartW;
  const getY = (v: number) => PADDING_TOP + chartH - ((v - minV) / range) * chartH;

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`)
    .join(' ');

  // Y-axis labels (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => minV + (range * i) / 4);

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

        {/* Goal line */}
        {goalValue != null && (
          <>
            <Line
              x1={PADDING_LEFT} y1={getY(goalValue)}
              x2={WIDTH - PADDING_RIGHT} y2={getY(goalValue)}
              stroke={goalColor} strokeWidth={1.5} strokeDasharray="6,4"
            />
            {goalLabel && (
              <SvgText x={WIDTH - PADDING_RIGHT} y={getY(goalValue) - 6} fill={goalColor} fontSize={9} textAnchor="end">
                {goalLabel}
              </SvgText>
            )}
          </>
        )}

        {/* Line path */}
        <Path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />

        {/* Data points */}
        {data.map((d, i) => (
          <Circle key={i} cx={getX(i)} cy={getY(d.value)} r={4} fill={color} stroke="#1A1F2B" strokeWidth={2} />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const showLabel = data.length <= 10 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1;
          if (!showLabel) return null;
          return (
            <SvgText key={i} x={getX(i)} y={height - 6} fill="#666" fontSize={9} textAnchor="middle">
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
});
