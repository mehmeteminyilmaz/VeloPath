import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: "VeloPath'e Hoş Geldin! 🚀",
    description: "Hayallerini ve projelerini haftalık planlara bölerek gerçeğe dönüştürmek için tasarlanmış en akıllı asistanınla tanış.",
    icon: "rocket-outline",
    color: "#6366f1"
  },
  {
    title: "Projelerini Özelleştir 🏗️",
    description: "Yeni bir proje oluştururken kendine özel renkler seçebilir, öncelik belirleyebilir ve hedeflerini tanımlayabilirsin.",
    icon: "layers-outline",
    color: "#ec4899"
  },
  {
    title: "Haftalık İlerleme 📅",
    description: "Her projeyi haftalara ayır, görevlerini düzenle ve ilerlemeni yüzdelik göstergelerle takip et.",
    icon: "calendar-outline",
    color: "#f59e0b"
  },
  {
    title: "Analiz ve Verimlilik 📈",
    description: "İstatistik sekmesinden performansını analiz et, en verimli günlerini keşfet ve istikrarını koru.",
    icon: "stats-chart-outline",
    color: "#10b981"
  }
];

export default function OnboardingScreen({ navigation }) {
  const { colors, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets);
  
  const [step, setStep] = useState(1);
  const totalSteps = STEPS.length;
  
  const currentStep = STEPS[step - 1];

  const handleComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    const uid = await AsyncStorage.getItem('userId');
    if (uid) {
      navigation.replace('Dashboard');
    } else {
      navigation.replace('Login');
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />
      
      <TouchableOpacity style={styles.skipBtn} onPress={handleComplete}>
        <Ionicons name="close" size={28} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: `${currentStep.color}15` }]}>
          <Ionicons name={currentStep.icon} size={64} color={currentStep.color} />
        </View>

        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.description}>{currentStep.description}</Text>

        <View style={styles.dotsWrap}>
          {STEPS.map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.dot, 
                idx + 1 === step && styles.dotActive,
                idx + 1 < step && styles.dotDone
              ]} 
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleComplete}>
          <Text style={styles.secondaryBtnText}>Atla</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
          <Text style={styles.primaryBtnText}>
            {step === totalSteps ? "Hadi Başlayalım!" : "Sıradaki"}
          </Text>
          <Ionicons 
            name={step === totalSteps ? "checkmark-circle" : "arrow-forward"} 
            size={20} 
            color="#fff" 
            style={{ marginLeft: 8 }} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  skipBtn: {
    position: 'absolute',
    top: insets.top + 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconWrap: {
    width: 120, height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  dotsWrap: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 20,
  },
  dotDone: {
    backgroundColor: colors.accent,
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: insets.bottom + 20,
  },
  secondaryBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
