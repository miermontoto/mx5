import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface FloatingActionButtonProps {
  onPress: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  const { settings } = useSettings();
  const scale = useSharedValue(0);
  const pulse = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });

    // Pulse animation
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      true
    );
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.1], [0.2, 0.1]),
  }));

  const handlePress = () => {
    rotation.value = withSequence(
      withTiming(180, { duration: 80 }),
      withTiming(360, { duration: 80 })
    );
    onPress();
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, animatedButtonStyle, { shadowColor: settings.accentColor }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[settings.accentColor, settings.accentColor + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="add" size={32} color={COLORS.text} />
        </View>
      </LinearGradient>

      {/* Animated glow effect */}
      <Animated.View style={[styles.glowEffect, animatedGlowStyle, { backgroundColor: settings.accentColor }]} />
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    ...SHADOWS.glow,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    zIndex: -1,
  },
});
