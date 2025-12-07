import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../constants';

interface MainStatProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  color?: string;
  showSign?: boolean;
}

export const MainStat: React.FC<MainStatProps> = ({
  label,
  value,
  unit = '',
  subtitle,
  color = COLORS.text,
  showSign = false
}) => {
  const sign = showSign && typeof value === 'number' && value >= 0 ? '+' : '';

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor: color + '20' }]}>
        {/* Gradient accent line */}
        <LinearGradient
          colors={[color + '00', color, color + '00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />
        
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color }]}>
            {sign}{typeof value === 'number' ? value.toFixed(0) : value}
          </Text>
          {unit && <Text style={[styles.unit, { color }]}>{unit}</Text>}
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        
        {/* Glow effect */}
        <View style={[styles.glowEffect, { backgroundColor: color + '10' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 12,
    opacity: 0.8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: -1,
  },
  unit: {
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 4,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    opacity: 0.6,
  },
  glowEffect: {
    position: 'absolute',
    bottom: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.5,
  },
});
