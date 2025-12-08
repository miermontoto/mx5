import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { COLORS, SHADOWS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { MileageEntry } from '../types';
import { updateEntry, deleteEntry } from '../utils/storage';

interface EditEntryModalProps {
  visible: boolean;
  entry: MileageEntry | null;
  onClose: () => void;
  onSave: () => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({
  visible,
  entry,
  onClose,
  onSave,
}) => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const [kilometers, setKilometers] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kmInputFocused, setKmInputFocused] = useState(false);
  const [noteInputFocused, setNoteInputFocused] = useState(false);

  const dateLocale = i18n.language === 'es' ? es : enUS;

  React.useEffect(() => {
    if (entry) {
      setKilometers(entry.totalKilometers.toString());
      setNote(entry.note || '');
      setDate(new Date(entry.date));
    }
  }, [entry]);

  const handleSave = async () => {
    if (!entry || !kilometers) return;

    setSaving(true);
    try {
      await updateEntry(entry.id, {
        totalKilometers: parseInt(kilometers, 10),
        note: note.trim(),
        date: date.toISOString(),
      });
      onSave();
      onClose();
    } catch (error) {
      Alert.alert(t('common.error'), t('editEntry.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!entry) return;

    Alert.alert(
      t('history.deleteTitle'),
      t('history.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await deleteEntry(entry.id);
              onSave();
              onClose();
            } catch (error) {
              Alert.alert(t('common.error'), t('editEntry.deleteError'));
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (!entry) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View entering={FadeIn.springify()} style={styles.content}>
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceLight]}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t('editEntry.title')}</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Date selector */}
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateLabel}>{t('editEntry.date')}</Text>
              <View style={styles.dateValue}>
                <Text style={styles.dateText}>
                  {format(date, i18n.language === 'es' ? "d 'de' MMMM, yyyy" : "MMMM d, yyyy", { locale: dateLocale })}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={settings.accentColor} />
              </View>
            </TouchableOpacity>

            {/* Kilometers input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('editEntry.kilometers')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: kmInputFocused ? settings.accentColor : settings.accentColor + '30' }
                ]}
                value={kilometers}
                onChangeText={setKilometers}
                keyboardType="numeric"
                placeholder={t('editEntry.kilometersPlaceholder')}
                placeholderTextColor={COLORS.textTertiary}
                onFocus={() => setKmInputFocused(true)}
                onBlur={() => setKmInputFocused(false)}
              />
            </View>

            {/* Note input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('editEntry.noteOptional')}</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.noteInput,
                  { borderColor: noteInputFocused ? settings.accentColor : settings.accentColor + '30' }
                ]}
                value={note}
                onChangeText={setNote}
                placeholder={t('editEntry.notePlaceholder')}
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={3}
                onFocus={() => setNoteInputFocused(true)}
                onBlur={() => setNoteInputFocused(false)}
              />
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.deleteButton]}
                onPress={handleDelete}
                disabled={saving}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: settings.accentColor },
                  !kilometers && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={!kilometers || saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? t('common.saving') : t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  gradient: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  dateSelector: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  dateValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: COLORS.text,
    borderWidth: 1,
    minHeight: 56,
  },
  noteInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
});
