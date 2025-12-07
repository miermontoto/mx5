import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from './src/constants';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { AddEntryScreen } from './src/screens/AddEntryScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { applyWebStyles } from './src/styles/globalStyles';
import { loadConfig } from './src/utils/storage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasConfig, setHasConfig] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadAssetsAndConfig();
    applyWebStyles();
  }, []);

  const loadAssetsAndConfig = async () => {
    try {
      // Load fonts - using system fonts for now
      // To use custom fonts, download Inter font files and uncomment below
      // await Font.loadAsync({
      //   'Inter-Regular': require('./src/assets/fonts/Inter-Regular.ttf'),
      //   'Inter-Medium': require('./src/assets/fonts/Inter-Medium.ttf'),
      //   'Inter-SemiBold': require('./src/assets/fonts/Inter-SemiBold.ttf'),
      //   'Inter-Bold': require('./src/assets/fonts/Inter-Bold.ttf'),
      //   'Inter-Light': require('./src/assets/fonts/Inter-Light.ttf'),
      // });
      setFontsLoaded(true);

      // Check config
      const config = await loadConfig();
      setHasConfig(!!config);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.text} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: COLORS.background },
            }}
            initialRouteName={hasConfig ? 'Main' : 'Setup'}
          >
            <Stack.Screen name="Setup" component={SetupScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="AddEntry"
              component={AddEntryScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
                gestureDirection: 'vertical',
                cardOverlayEnabled: true,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
