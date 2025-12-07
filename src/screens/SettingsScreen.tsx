import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown
} from 'react-native-reanimated';
import { ColorPicker } from '../components/ColorPicker';
import { COLORS, SHADOWS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { DEFAULT_SETTINGS } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const { settings, updateSettings } = useSettings();
  const [yearlyLimit, setYearlyLimit] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(settings.startDate));
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    setYearlyLimit(settings.yearlyLimit.toString());
  }, [settings]);

  const handleColorSelect = async (color: string) => {
    setIsSaving(true);
    await updateSettings({ ...settings, accentColor: color });
    setIsSaving(false);
  };

  const handleYearlyLimitChange = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    setYearlyLimit(cleaned);
  };

  const handleYearlyLimitSubmit = async () => {
    const limit = parseInt(yearlyLimit);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Error', 'Por favor ingresa un límite anual válido');
      setYearlyLimit(settings.yearlyLimit.toString());
      return;
    }
    setIsSaving(true);
    await updateSettings({ ...settings, yearlyLimit: limit });
    setIsSaving(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      handleDateSubmit(date);
    }
  };

  const handleDateSubmit = async (date: Date) => {
    setIsSaving(true);
    await updateSettings({ ...settings, startDate: date.toISOString() });
    setIsSaving(false);
  };

  // Remove the manual save button function as we're saving automatically

  const handleReset = () => {
    Alert.alert(
      'Restablecer configuración',
      '¿Estás seguro de que quieres restablecer toda la configuración a los valores predeterminados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            setYearlyLimit(DEFAULT_SETTINGS.yearlyLimit.toString());
            setIsSaving(true);
            await updateSettings(DEFAULT_SETTINGS);
            setIsSaving(false);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary]}
        style={styles.gradient}
      />

      <Animated.View
        entering={FadeIn.duration(600)}
        style={styles.header}
      >
        <Text style={styles.title}>Configuración</Text>
      </Animated.View>

      <Animated.View
        entering={SlideInDown.delay(100).springify()}
        style={[styles.section, { marginBottom: 0 }]}
      >
        <Text style={styles.sectionTitle}>LÍMITES</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Límite anual de kilómetros</Text>
          <View style={[
            styles.inputContainer,
            focusedInput === 'yearlyLimit' && [styles.inputContainerFocused, { borderColor: settings.accentColor }]
          ]}>
            <TextInput
              style={styles.input}
              value={yearlyLimit}
              onChangeText={handleYearlyLimitChange}
              onFocus={() => setFocusedInput('yearlyLimit')}
              onBlur={() => {
                setFocusedInput(null);
                handleYearlyLimitSubmit();
              }}
              keyboardType="numeric"
              placeholder="10000"
              placeholderTextColor={COLORS.textTertiary}
              selectionColor={settings.accentColor}
            />
            <Text style={styles.inputUnit}>KM</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fecha de inicio del período anual</Text>
          <TouchableOpacity
            style={[
              styles.inputContainer,
              showDatePicker && [styles.inputContainerFocused, { borderColor: settings.accentColor }]
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dateText}>
              {new Date(settings.startDate).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.helperText}>
            Esta fecha marca el inicio de tu período anual de {settings.yearlyLimit.toLocaleString('es')} km
          </Text>
        </View>
      </Animated.View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <Animated.View
        entering={SlideInDown.delay(200).springify()}
        style={styles.section}
      >
        <ColorPicker
          selectedColor={settings.accentColor}
          onColorSelect={handleColorSelect}
        />
      </Animated.View>


      <Animated.View
        entering={SlideInDown.delay(300).springify()}
        style={styles.buttonsContainer}
      >
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>Restablecer valores predeterminados</Text>
        </TouchableOpacity>
      </Animated.View>

      {isSaving && (
        <View style={styles.savingIndicator}>
          <Text style={styles.savingText}>Guardando...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 56,
    ...SHADOWS.small,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '400',
  },
  inputUnit: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  dateText: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '400',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    paddingHorizontal: 4,
    lineHeight: 16,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  saveButton: {
    ...SHADOWS.medium,
  },
  buttonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 1.5,
  },
  resetButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  savingIndicator: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  savingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
});
