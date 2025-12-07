import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { COLORS, YEARLY_LIMIT } from '../constants';
import { useSettings } from '../contexts/SettingsContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedCircularGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
}

export const AnimatedCircularGauge: React.FC<AnimatedCircularGaugeProps> = ({
  value,
  maxValue = YEARLY_LIMIT,
  size = 280,
  strokeWidth = 20,
}) => {
  const { settings } = useSettings();
  const progress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const percentage = Math.min((value / maxValue) * 100, 100);

  useEffect(() => {
    progress.value = withTiming(percentage / 100, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage]);

  // Create arc path for the gauge
  const startAngle = -90; // Start from top
  const endAngle = 270; // Full circle
  const angleRange = endAngle - startAngle;

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

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const currentAngle = startAngle + (angleRange * progress.value);
    // Calculate arc end point inline
    const angleInRadians = (currentAngle - 90) * Math.PI / 180.0;
    const arcEndX = center + (radius * Math.cos(angleInRadians));
    const arcEndY = center + (radius * Math.sin(angleInRadians));
    const largeArcFlag = progress.value > 0.5 ? 1 : 0;

    return {
      d: `M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcEndX} ${arcEndY}`,
    };
  });

  const animatedGlowProps = useAnimatedProps(() => {
    'worklet';
    const currentAngle = startAngle + (angleRange * progress.value);
    // Calculate arc end point inline
    const angleInRadians = (currentAngle - 90) * Math.PI / 180.0;
    const arcEndX = center + (radius * Math.cos(angleInRadians));
    const arcEndY = center + (radius * Math.sin(angleInRadians));
    const largeArcFlag = progress.value > 0.5 ? 1 : 0;

    return {
      d: `M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcEndX} ${arcEndY}`,
      opacity: interpolate(progress.value, [0, 1], [0.1, 0.3]),
    };
  });

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
            <Stop offset="0%" stopColor={settings.accentColor} />
            <Stop offset="50%" stopColor={settings.accentColor + 'CC'} />
            <Stop offset="100%" stopColor={settings.accentColor + '88'} />
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

        {/* Glow effect */}
        <AnimatedPath
          animatedProps={animatedGlowProps}
          stroke={settings.accentColor}
          strokeWidth={strokeWidth + 10}
          fill="none"
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <AnimatedPath
          animatedProps={animatedProps}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.value}>{value.toFixed(0)}</Text>
        <Text style={styles.unit}>KM</Text>
        <View style={styles.divider} />
        <Text style={[styles.percentage, { color: settings.accentColor }]}>{percentage.toFixed(1)}%</Text>
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
