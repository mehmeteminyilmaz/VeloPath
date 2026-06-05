import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from './colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('dark');
  const [accentColor, setAccentColorState] = useState(null);

  useEffect(() => {
    // Load theme
    AsyncStorage.getItem('theme').then(savedTheme => {
      if (savedTheme) setThemeName(savedTheme);
    });

    // Load accent color
    AsyncStorage.getItem('velopath_accent').then(savedAccent => {
      if (savedAccent) setAccentColorState(savedAccent);
    });
  }, []);

  const toggleTheme = async () => {
    const newTheme = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const setAccentColor = async (color) => {
    setAccentColorState(color);
    if (color) {
      await AsyncStorage.setItem('velopath_accent', color);
    } else {
      await AsyncStorage.removeItem('velopath_accent');
    }
  };

  const baseColors = THEMES[themeName];
  const colors = {
    ...baseColors,
    accent: accentColor || baseColors.accent,
  };

  return (
    <ThemeContext.Provider value={{ themeName, colors, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
