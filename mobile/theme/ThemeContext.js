import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from './colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('dark');

  useEffect(() => {
    AsyncStorage.getItem('theme').then(savedTheme => {
      if (savedTheme) setThemeName(savedTheme);
    });
  }, []);

  const toggleTheme = async () => {
    const newTheme = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const colors = THEMES[themeName];

  return (
    <ThemeContext.Provider value={{ themeName, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
