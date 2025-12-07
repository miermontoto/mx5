import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { COLORS, YEARLY_LIMIT } from '../constants';

interface CircularGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  maxValue = YEARLY_LIMIT,
  size = 280,
  strokeWidth = 20,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / maxValue) * 100, 100);

  // Create arc path for the gauge
  const startAngle = -90; // Start from top
  const endAngle = 270; // Full circle
  const angleRange = endAngle - startAngle;
  const currentAngle = startAngle + (angleRange * percentage) / 100;

  // Convert polar to cartesian for SVG path
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const center = size / 2;
  const arcStart = polarToCartesian(center, center, radius, startAngle);
  const arcEnd = polarToCartesian(center, center, radius, currentAngle);
  const largeArcFlag = percentage > 50 ? 1 : 0;

  // Create tick marks
  const ticks = [];
  const majorTickCount = 10;
  for (let i = 0; i <= majorTickCount; i++) {
    const angle = startAngle + (angleRange * i) / majorTickCount;
    const innerRadius = radius - 10;
    const outerRadius = radius - (i % 5 === 0 ? 20 : 15);

    const inner = polarToCartesian(center, center, innerRadius, angle);
    const outer = polarToCartesian(center, center, outerRadius, angle);

    ticks.push(
      <Path
        key={`tick-${i}`}
        d={`M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`}
        stroke={COLORS.textTertiary}
        strokeWidth={i % 5 === 0 ? 2 : 1}
        opacity={0.5}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.gradientStart} />
            <Stop offset="50%" stopColor={COLORS.gradientEnd} />
            <Stop offset="100%" stopColor={COLORS.gradientAccent} />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={COLORS.surface}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Tick marks */}
        {ticks}

        {/* Progress arc */}
        <Path
          d={`M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcEnd.x} ${arcEnd.y}`}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Glow effect */}
        <Path
          d={`M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcEnd.x} ${arcEnd.y}`}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth + 10}
          fill="none"
          strokeLinecap="round"
          opacity={0.3}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.value}>{value.toFixed(0)}</Text>
        <Text style={styles.unit}>KM</Text>
        <View style={styles.divider} />
        <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
        <Text style={styles.label}>del límite anual</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 56,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -2,
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginTop: -8,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '400',
    color: COLORS.primary,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
