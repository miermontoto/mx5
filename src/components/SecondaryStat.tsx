import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants';

interface SecondaryStatProps {
  value: string | number;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

export const SecondaryStat: React.FC<SecondaryStatProps> = ({
  value,
  label,
  color = COLORS.text,
  icon
}) => {
  const formattedValue = typeof value === 'number' && !value.toString().includes('.')
    ? value.toLocaleString('es-ES')
    : value;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.colorIndicator, { backgroundColor: color + '30' }]} />
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.content}>
          <Text style={[styles.value, { color }]}>{formattedValue}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  colorIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  iconContainer: {
    marginRight: 12,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingLeft: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    opacity: 0.7,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
});
