import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { AnimatedCircularGauge } from './AnimatedCircularGauge';

interface MainCardProps {
  totalKm: number;
  percentage: number;
}

export const MainCard: React.FC<MainCardProps> = ({ totalKm, percentage }) => {
  const { settings } = useSettings();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  // Animation values for decorative elements
  const floatAnimation1 = useSharedValue(0);
  const floatAnimation2 = useSharedValue(0);
  const floatAnimation3 = useSharedValue(0);
  const floatAnimation4 = useSharedValue(0);
  const rotateAnimation = useSharedValue(0);

  useEffect(() => {
    // Card entrance animation
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    });

    // Floating animations for decorative elements
    floatAnimation1.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    floatAnimation2.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    floatAnimation3.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    floatAnimation4.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Rotation animation
    rotateAnimation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Animated styles for decorative elements
  const decorativeStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnimation1.value, [0, 1], [0, -20]) },
      { translateX: interpolate(floatAnimation1.value, [0, 1], [0, 10]) },
    ],
  }));

  const decorativeStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnimation2.value, [0, 1], [0, 20]) },
      { translateX: interpolate(floatAnimation2.value, [0, 1], [0, -15]) },
    ],
  }));

  const decorativeStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnimation3.value, [0, 1], [0, -15]) },
      { rotate: `${rotateAnimation.value}deg` },
    ],
  }));

  const decorativeStyle4 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(floatAnimation4.value, [0, 1], [0, 20]) },
      { scale: interpolate(floatAnimation4.value, [0, 0.5, 1], [1, 1.2, 1]) },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, { shadowColor: settings.accentColor }]}>
      {/* Background gradient mesh */}
      <LinearGradient
        colors={[COLORS.darkGradientStart, COLORS.darkGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Glass card */}
      <View style={styles.glassCard}>
        <View style={styles.header}>
          <Text style={styles.label}>KILOMETRAJE ANUAL</Text>
          <View style={[styles.yearBadge, { backgroundColor: settings.accentColor + '20', borderColor: settings.accentColor + '30' }]}>
            <Text style={[styles.yearText, { color: settings.accentColor }]}>{new Date().getFullYear()}</Text>
          </View>
        </View>

        {/* Circular gauge */}
        <View style={styles.gaugeContainer}>
          <AnimatedCircularGauge value={totalKm} maxValue={settings.yearlyLimit} />
        </View>

        {/* Animated decorative elements */}
        <Animated.View style={[styles.decorativeCircle1, decorativeStyle1, { backgroundColor: settings.accentColor + '10' }]} />
        <Animated.View style={[styles.decorativeCircle2, decorativeStyle2, { backgroundColor: settings.accentColor + '08' }]} />
        <Animated.View style={[styles.decorativeCircle3, decorativeStyle3, { backgroundColor: settings.accentColor + '05' }]} />
        <Animated.View style={[styles.decorativeCircle4, decorativeStyle4, { backgroundColor: settings.accentColor + '12' }]} />

        {/* Additional smaller decorative specs */}
        <Animated.View style={[styles.decorativeSpec1, decorativeStyle2, { backgroundColor: settings.accentColor + '15' }]} />
        <Animated.View style={[styles.decorativeSpec2, decorativeStyle4, { backgroundColor: settings.accentColor + '10' }]} />
        <Animated.View style={[styles.decorativeSpec3, decorativeStyle1, { backgroundColor: settings.accentColor + '20' }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  glassCard: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 24,
    padding: 24,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  yearBadge: {
    backgroundColor: COLORS.primaryGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  yearText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  // Large decorative circles
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.meshColor1,
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.meshColor2,
    bottom: -75,
    left: -75,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.meshColor3,
    top: 50,
    left: -60,
  },
  decorativeCircle4: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.meshColor1,
    bottom: 30,
    right: -50,
  },
  // Smaller decorative specs
  decorativeSpec1: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    top: 80,
    right: 40,
  },
  decorativeSpec2: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    bottom: 100,
    left: 30,
  },
  decorativeSpec3: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    top: 140,
    left: 100,
  },
});
