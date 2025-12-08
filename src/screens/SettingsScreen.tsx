import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
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
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '../components/ColorPicker';
import { COLORS, SHADOWS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { DEFAULT_SETTINGS } from '../utils/storage';

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const [yearlyLimit, setYearlyLimit] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(settings.startDate));
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const dateLocale = i18n.language === 'es' ? es : enUS;

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
      Alert.alert(t('common.error'), t('settings.invalidLimit'));
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

  const handleLanguageSelect = async (langCode: string) => {
    setShowLanguagePicker(false);
    setIsSaving(true);
    await updateSettings({ ...settings, language: langCode as 'es' | 'en' });
    setIsSaving(false);
  };

  const handleReset = () => {
    Alert.alert(
      t('settings.resetTitle'),
      t('settings.resetMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.reset'),
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

  const currentLanguage = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary]}
        style={styles.gradient}
      />

      <Animated.View
        entering={FadeIn.duration(600)}
        style={styles.header}
      >
        <Text style={styles.title}>{t('settings.title')}</Text>
      </Animated.View>

      <Animated.View
        entering={SlideInDown.delay(100).springify()}
        style={[styles.section, { marginBottom: 0 }]}
      >
        <Text style={styles.sectionTitle}>{t('settings.limits')}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('settings.yearlyLimit')}</Text>
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
            <Text style={styles.inputUnit}>{t('common.kmUnit')}</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('settings.startDate')}</Text>
          <TouchableOpacity
            style={[
              styles.inputContainer,
              showDatePicker && [styles.inputContainerFocused, { borderColor: settings.accentColor }]
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dateText}>
              {format(new Date(settings.startDate), i18n.language === 'es' ? "d 'de' MMMM 'de' yyyy" : "MMMM d, yyyy", { locale: dateLocale })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.helperText}>
            {t('settings.startDateHelper', { value: settings.yearlyLimit.toLocaleString(i18n.language) })}
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
        entering={SlideInDown.delay(250).springify()}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowLanguagePicker(true)}
          activeOpacity={0.7}
        >
          <View style={styles.selectedOption}>
            <Text style={styles.flagText}>{currentLanguage.flag}</Text>
            <Text style={styles.selectedText}>{currentLanguage.name}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={showLanguagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowLanguagePicker(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {LANGUAGES.map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleLanguageSelect(lang.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.flagText}>{lang.flag}</Text>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {lang.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={COLORS.text} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>

      <Animated.View
        entering={SlideInDown.delay(300).springify()}
        style={styles.buttonsContainer}
      >
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>{t('settings.resetDefaults')}</Text>
        </TouchableOpacity>
      </Animated.View>

      {isSaving && (
        <View style={styles.savingIndicator}>
          <Text style={styles.savingText}>{t('common.saving')}</Text>
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
  scrollContent: {
    flexGrow: 1,
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
  selectedOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  flagText: {
    fontSize: 20,
    marginRight: 12,
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
    padding: 16,
    borderRadius: 10,
    marginVertical: 2,
  },
  optionSelected: {
    backgroundColor: COLORS.surface,
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
