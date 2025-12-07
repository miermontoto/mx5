import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedPreset = PRESET_COLORS.find(c => c.color === selectedColor);

  const handleSelect = (color: string) => {
    onColorSelect(color);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>COLOR DE ACENTO</Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectedOption}>
          <View style={[styles.colorDot, { backgroundColor: selectedColor }]} />
          <Text style={styles.selectedText}>
            {selectedPreset?.name || 'Custom'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar color</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {PRESET_COLORS.map((preset) => {
                const isSelected = selectedColor === preset.color;
                return (
                  <TouchableOpacity
                    key={preset.color}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(preset.color)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={preset.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.optionColorDot}
                    />
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {preset.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={COLORS.text} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectedOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  selectedText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    maxHeight: '70%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionsList: {
    padding: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginVertical: 2,
  },
  optionSelected: {
    backgroundColor: COLORS.surface,
  },
  optionColorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  optionTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
});
