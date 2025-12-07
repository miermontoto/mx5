import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { saveConfig } from '../utils/storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const SetupScreen = ({ navigation }: any) => {
  const { settings, updateSettings } = useSettings();
  const [startDate, setStartDate] = useState(new Date());
  const [initialKm, setInitialKm] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const buttonScale = useSharedValue(1);

  const handleSave = async () => {
    buttonScale.value = withSpring(0.95);
    
    try {
      // Update settings with the initial configuration
      await updateSettings({
        ...settings,
        startDate: startDate.toISOString(),
        initialKilometers: initialKm ? Number(initialKm) : 0,
      });
      
      // Also save to config for backward compatibility
      await saveConfig({
        startDate: startDate.toISOString(),
        initialKilometers: initialKm ? Number(initialKm) : undefined,
      });
      
      buttonScale.value = withSpring(1);
      navigation.replace('Main');
    } catch (error) {
      buttonScale.value = withSpring(1);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleKmChange = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    setInitialKm(cleaned);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary]}
        style={styles.gradient}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeIn.duration(800)}
          style={styles.header}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[settings.accentColor, settings.accentColor + 'CC']}
              style={styles.iconGradient}
            >
              <Ionicons name="car-sport" size={40} color={COLORS.text} />
            </LinearGradient>
          </View>
          
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>
            Configura el inicio de tu período anual de {settings.yearlyLimit.toLocaleString('es')} km
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.form}
        >
          <View style={styles.section}>
            <Text style={styles.label}>FECHA DE INICIO</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                showDatePicker && [styles.inputContainerFocused, { borderColor: settings.accentColor }]
              ]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.dateText}>
                {format(startDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
              </Text>
            </TouchableOpacity>
            <Text style={styles.helper}>
              Desde esta fecha se contarán los {settings.yearlyLimit.toLocaleString('es')} km anuales
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>KILOMETRAJE INICIAL (OPCIONAL)</Text>
            <View style={[
              styles.inputContainer,
              focusedInput === 'km' && [styles.inputContainerFocused, { borderColor: settings.accentColor }]
            ]}>
              <Ionicons name="speedometer-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                value={initialKm}
                onChangeText={handleKmChange}
                onFocus={() => setFocusedInput('km')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textTertiary}
                selectionColor={settings.accentColor}
              />
              <Text style={styles.inputUnit}>KM</Text>
            </View>
            <Text style={styles.helper}>
              Lectura actual del odómetro (opcional)
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          style={styles.buttonContainer}
        >
          <AnimatedTouchableOpacity
            style={[styles.saveButton, buttonAnimatedStyle]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[settings.accentColor, settings.accentColor + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.saveButtonText}>COMENZAR</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.text} style={styles.buttonIcon} />
            </LinearGradient>
          </AnimatedTouchableOpacity>
        </Animated.View>

        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') {
                setShowDatePicker(false);
              }
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 16,
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
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  dateText: {
    flex: 1,
    fontSize: 18,
    color: COLORS.text,
    marginLeft: 12,
    fontWeight: '400',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: COLORS.text,
    marginLeft: 12,
    paddingVertical: 16,
    fontWeight: '400',
  },
  inputUnit: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  helper: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    paddingHorizontal: 4,
    lineHeight: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 1.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});