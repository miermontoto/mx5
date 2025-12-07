import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const PRESET_COLORS = [
  { name: 'Soul Red', color: '#CC0000', gradient: ['#CC0000', '#FF0000'] as [string, string] },
  { name: 'Racing Blue', color: '#0080FF', gradient: ['#0080FF', '#00A8FF'] as [string, string] },
  { name: 'British Green', color: '#004225', gradient: ['#004225', '#006B3C'] as [string, string] },
  { name: 'Orange Fury', color: '#FF6600', gradient: ['#FF6600', '#FF8533'] as [string, string] },
  { name: 'Purple Dream', color: '#9B59B6', gradient: ['#9B59B6', '#B47BCF'] as [string, string] },
  { name: 'Golden Hour', color: '#F39C12', gradient: ['#F39C12', '#FFB84D'] as [string, string] },
  { name: 'Arctic Silver', color: '#95A5A6', gradient: ['#95A5A6', '#BDC3C7'] as [string, string] },
  { name: 'Midnight Blue', color: '#2C3E50', gradient: ['#2C3E50', '#34495E'] as [string, string] },
  { name: 'Pink Blossom', color: '#FF69B4', gradient: ['#FF69B4', '#FF91C9'] as [string, string] },
  { name: 'Electric Teal', color: '#00CED1', gradient: ['#00CED1', '#00E5E8'] as [string, string] },
  { name: 'Sunset Orange', color: '#FF4500', gradient: ['#FF4500', '#FF6347'] as [string, string] },
];

const { width: screenWidth } = Dimensions.get('window');
const COLUMNS = screenWidth > 600 ? 6 : 4;
const MAX_ITEM_SIZE = 75;
const PADDING = 40;
const ITEM_SIZE = Math.min(MAX_ITEM_SIZE, (screenWidth - PADDING - (COLUMNS * 16)) / COLUMNS);

interface ColorItemProps {
  preset: typeof PRESET_COLORS[0];
  isSelected: boolean;
  onPress: () => void;
}

const ColorItem: React.FC<ColorItemProps> = ({ preset, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.colorItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.colorContainer}>
        <LinearGradient
          colors={preset.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.colorGradient}
        />

        {isSelected && (
          <>
            <View style={styles.selectedBorder} />
            <View style={styles.checkContainer}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </>
        )}
      </View>

      <Text style={[
        styles.colorName,
        isSelected && styles.selectedName
      ]} numberOfLines={1}>
        {preset.name}
      </Text>
    </TouchableOpacity>
  );
};

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorSelect }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>COLOR DE ACENTO</Text>
        <View style={[styles.currentColorBadge, { backgroundColor: selectedColor + '20' }]}>
          <View style={[styles.currentColorDot, { backgroundColor: selectedColor }]} />
          <Text style={[styles.currentColorText, { color: selectedColor }]}>
            {PRESET_COLORS.find(c => c.color === selectedColor)?.name || 'Custom'}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {PRESET_COLORS.map((preset) => (
          <ColorItem
            key={preset.color}
            preset={preset}
            isSelected={selectedColor === preset.color}
            onPress={() => onColorSelect(preset.color)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    fontWeight: '600',
  },
  currentColorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  currentColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  currentColorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    justifyContent: 'center',
  },
  colorItem: {
    width: ITEM_SIZE + 16,
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  colorContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: 8,
    position: 'relative',
  },
  colorGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    ...SHADOWS.medium,
  },
  selectedBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.text,
  },
  checkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
  },
  checkmark: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  colorName: {
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  selectedName: {
    color: COLORS.text,
    fontWeight: '600',
  },
});
