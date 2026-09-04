import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export type ChartPoint = {
  label: string;
  value: number;
};

type Props = {
  points: ChartPoint[];
  unit: string;
  height?: number;
};

const PADDING_X = 12;
const PADDING_Y = 16;

/** Small hand-rolled SVG line chart — see DEVELOPMENT_LOG.md for why this was
 *  chosen over a charting library (fewer dependencies, guaranteed Expo Go
 *  compatibility, and the actual chart need here is this simple). */
export function LineChart({ points, unit, height = 160 }: Props) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const values = points.map((p) => p.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const plotWidth = Math.max(0, width - PADDING_X * 2);
  const plotHeight = height - PADDING_Y * 2;

  const coords = points.map((p, i) => ({
    x: PADDING_X + (points.length === 1 ? plotWidth / 2 : (i / (points.length - 1)) * plotWidth),
    y: PADDING_Y + plotHeight - ((p.value - minValue) / valueRange) * plotHeight,
  }));

  const latest = points[points.length - 1];

  return (
    <View>
      <Text style={styles.latestValue}>
        {latest.value.toFixed(1)} <Text style={styles.unit}>{unit}</Text>
      </Text>

      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Line
              x1={PADDING_X}
              y1={PADDING_Y + plotHeight}
              x2={width - PADDING_X}
              y2={PADDING_Y + plotHeight}
              stroke={colors.border}
              strokeWidth={1}
            />
            <Polyline points={coords.map((c) => `${c.x},${c.y}`).join(' ')} fill="none" stroke={colors.primary} strokeWidth={2} />
            {coords.map((c, i) => (
              <Circle key={i} cx={c.x} cy={c.y} r={3.5} fill={colors.primary} />
            ))}
          </Svg>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.axisLabel}>{points[0].label}</Text>
        <Text style={styles.axisLabel}>
          {minValue.toFixed(0)}–{maxValue.toFixed(0)} {unit}
        </Text>
        <Text style={styles.axisLabel}>{points[points.length - 1].label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  latestValue: {
    ...typography.bigNumber,
    color: colors.text,
    marginBottom: 4,
  },
  unit: {
    ...typography.caption,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  axisLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
