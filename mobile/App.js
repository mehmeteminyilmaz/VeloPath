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
import WeeklyPlanScreen from './screens/WeeklyPlanScreen';
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
          lightColor: colors.accent,
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

    // Token geçerliliğini backend'den doğrula
    const checkAuth = async () => {
      try {
        const [uid, token, seen] = await Promise.all([
          AsyncStorage.getItem('userId'),
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('hasSeenOnboarding'),
        ]);

        if (!seen) {
          setInitialRoute('Onboarding');
          return;
        }

        if (!uid || !token) {
          setInitialRoute('Login');
          return;
        }

        // Token'ın hâlâ geçerli olup olmadığını backend'e sor
        const { API_BASE } = await import('./services/api');
        const response = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setInitialRoute('Dashboard');
        } else if (response.status === 401) {
          // Token süresi dolmuş olabilir, yenilemeyi dene
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${API_BASE}/users/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                await AsyncStorage.setItem('token', refreshData.token);
                if (refreshData.refreshToken) {
                  await AsyncStorage.setItem('refreshToken', refreshData.refreshToken);
                }
                setInitialRoute('Dashboard');
                return;
              }
            } catch (e) {
              console.error("Token yenileme hatasi:", e);
            }
          }
          // Refresh başarısız olduysa veya yoksa oturumu temizle
          await AsyncStorage.multiRemove(['userId', 'username', 'token', 'refreshToken']);
          setInitialRoute('Login');
        } else {
          // Sunucu hatası veya diğer durumlarda Dashboard'a yönlendir (çevrimdışı destek)
          setInitialRoute('Dashboard');
        }
      } catch (_) {
        // İnternet/ağ hatası durumunda Dashboard'a yönlendir (çevrimdışı destek)
        setInitialRoute('Dashboard');
      }
    };

    checkAuth();
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
          <Stack.Screen name="WeeklyPlan" component={WeeklyPlanScreen} />
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
