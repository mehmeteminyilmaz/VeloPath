import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export default function PomodoroScreen() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          clearInterval(interval);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pomodoro Odaklanma</Text>
      
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggleTimer}>
          <Ionicons 
            name={isActive ? "pause-circle" : "play-circle"} 
            size={80} 
            color={COLORS.accent} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
          <Text style={styles.resetText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="bulb-outline" size={24} color={COLORS.accent} />
        <Text style={styles.infoText}>
          Web'deki zamanlayıcınla uyumlu çalışır. Odaklanma süreni verimli kullan!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 4,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    backgroundColor: COLORS.card,
  },
  timerText: {
    color: '#fff',
    fontSize: 60,
    fontWeight: '200',
  },
  controls: {
    marginTop: 50,
    alignItems: 'center',
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  resetText: {
    color: '#aaa',
    fontSize: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 15,
    marginTop: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  infoText: {
    color: '#ccc',
    marginLeft: 15,
    flex: 1,
    fontSize: 14,
  }
});
