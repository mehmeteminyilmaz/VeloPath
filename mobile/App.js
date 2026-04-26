import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProjectDetailsScreen from './screens/ProjectDetailsScreen';
import { COLORS } from './theme/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    // Kullanıcı daha önce giriş yaptıysa direkt Dashboard'a git
    AsyncStorage.getItem('userId').then(uid => {
      setInitialRoute(uid ? 'Dashboard' : 'Login');
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
