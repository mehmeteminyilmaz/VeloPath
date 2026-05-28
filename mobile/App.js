import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Platform, LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProjectDetailsScreen from './screens/ProjectDetailsScreen';
import PomodoroScreen from './screens/PomodoroScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
import CreateProjectScreen from './screens/CreateProjectScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

const Stack = createNativeStackNavigator();

function Navigation() {
  const [initialRoute, setInitialRoute] = useState(null);
  const { colors } = useTheme();

  useEffect(() => {
    // Bildirim izinlerini iste
    const registerForPushNotificationsAsync = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366f1',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('Bildirim izni alınamadı!');
          return;
        }
      }
    };

    registerForPushNotificationsAsync();

    Promise.all([
      AsyncStorage.getItem('userId'),
      AsyncStorage.getItem('hasSeenOnboarding')
    ]).then(([uid, seen]) => {
      if (!seen) {
        setInitialRoute('Onboarding');
      } else {
        setInitialRoute(uid ? 'Dashboard' : 'Login');
      }
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.bg,
      card: colors.bg,
      text: '#fff',
      border: 'transparent',
      notification: colors.accent,
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: colors.bg }
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
          <Stack.Screen name="Pomodoro" component={PomodoroScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Stats" component={StatsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="CreateProject" component={CreateProjectScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
}
