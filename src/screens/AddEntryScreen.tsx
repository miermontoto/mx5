import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../constants';
import { addEntry, getLatestReading } from '../utils/storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSettings } from '../contexts/SettingsContext';
import { Ionicons } from '@expo/vector-icons';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const AddEntryScreen = ({ navigation }: any) => {
  const { settings } = useSettings();
  const [totalKilometers, setTotalKilometers] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastReading, setLastReading] = useState<number>(0);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    loadLastReading();
  }, []);

  const loadLastReading = async () => {
    const reading = await getLatestReading();
    setLastReading(reading);
    setTotalKilometers(reading.toString());
  };

  const handleSave = async () => {
    if (!totalKilometers || isNaN(Number(totalKilometers)) || Number(totalKilometers) < 0) {
      Alert.alert('Entrada inválida', 'Por favor ingresa una distancia total válida');
      return;
    }

    if (Number(totalKilometers) < lastReading) {
      Alert.alert(
        'Confirmar lectura menor',
        `La nueva lectura (${Number(totalKilometers).toLocaleString('es')} km) es menor que la última (${lastReading.toLocaleString('es')} km). ¿Continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => saveEntry() }
        ]
      );
      return;
    }

    await saveEntry();
  };

  const saveEntry = async () => {
    setIsLoading(true);
    buttonScale.value = withSpring(0.95);
    
    try {
      await addEntry({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        totalKilometers: Number(totalKilometers),
        note: note.trim() || undefined,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
      buttonScale.value = withSpring(1);
    }
  };
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary]}
        style={styles.gradient}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View 
          entering={FadeIn.duration(600)}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Nuevo Registro</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.date}>
              {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={SlideInDown.delay(200).springify()}
          style={styles.form}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ODÓMETRO ACTUAL</Text>
            <View style={[
              styles.inputContainer,
              focusedInput === 'km' && [styles.inputContainerFocused, { borderColor: settings.accentColor }]
            ]}>
              <TextInput
                style={styles.input}
                value={totalKilometers}
                onChangeText={setTotalKilometers}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textTertiary}
                onFocus={() => setFocusedInput('km')}
                onBlur={() => setFocusedInput(null)}
                autoFocus
              />
              <Text style={styles.inputUnit}>KM</Text>
            </View>
            {lastReading > 0 && (
              <View style={styles.helperContainer}>
                <View style={[styles.helperDot, { backgroundColor: settings.accentColor }]} />
                <Text style={styles.helper}>
                  Último registro: {lastReading.toLocaleString('es')} km
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOTAS (OPCIONAL)</Text>
            <View style={[
              styles.inputContainer,
              styles.textAreaContainer,
              focusedInput === 'note' && [styles.inputContainerFocused, { borderColor: settings.accentColor }]
            ]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder="Detalles del viaje, mantenimiento, etc..."
                placeholderTextColor={COLORS.textTertiary}
                onFocus={() => setFocusedInput('note')}
                onBlur={() => setFocusedInput(null)}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={SlideInDown.delay(400).springify()}
          style={styles.buttonContainer}
        >
          <AnimatedTouchableOpacity
            style={[styles.button, styles.saveButton, buttonAnimatedStyle]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[settings.accentColor, settings.accentColor + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'GUARDANDO...' : 'GUARDAR REGISTRO'}
              </Text>
            </LinearGradient>
          </AnimatedTouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -1,
  },
  dateBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 40,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
    letterSpacing: 2,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    ...SHADOWS.small,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 20,
    fontSize: 28,
    color: COLORS.text,
    fontWeight: '300',
    letterSpacing: -1,
  },
  inputUnit: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  textArea: {
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: 0,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  helperDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  helper: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  buttonContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
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
});