import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: "VeloPath Dünyasına Hoş Geldin! 🚀",
    description: "Hayallerini ve projelerini, yapay zekanın gücüyle haftalık mikro adımlara bölerek gerçeğe dönüştürmek için tasarlanmış en akıllı asistanınla tanışmaya hazır mısın?",
    badge: "GİRİŞ",
    icon: "rocket-outline",
    color: "#6366f1"
  },
  {
    title: "Yapay Zeka Planlama Gücü 🧠",
    description: "Karmaşık hedeflerini gir, gerisini VeloPath AI'a bırak. Projeni yönetilebilir küçük parçalara böler, zaman çizelgeleri ve öncelik sıralamaları oluşturur.",
    badge: "AI ASİSTAN",
    icon: "bulb-outline",
    color: "#8b5cf6"
  },
  {
    title: "Haftalık Sürükle-Bırak Planı 📅",
    description: "Görevleri haftalık planlara yay. Durumlarını sürükle-bırak ile yönet. Tamamlama oranlarını dairesel grafiklerle takip et, hiçbir detayı gözden kaçırma.",
    badge: "PLANLAYICI",
    icon: "calendar-outline",
    color: "#f59e0b"
  },
  {
    title: "Verimlilik Analizi ve Seriler 📈",
    description: "Performansını analiz et, en aktif olduğunuz günleri keşfet. Günlük görevlerini aksatmadan tamamlayarak 'Streak' serilerini büyüt ve motivasyonunu hep zirvede tut.",
    badge: "İSTATİSTİK",
    icon: "stats-chart-outline",
    color: "#10b981"
  }
];

export default function OnboardingModal({ visible, onClose }) {
  const { colors, themeName } = useTheme();
  const [step, setStep] = useState(1);
  const totalSteps = STEPS.length;
  const currentStep = STEPS[step - 1];
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const isLight = themeName === 'light';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: isLight ? '#f3f4f6' : '#1e293b' }]}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleSkip}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Icon Wrapper */}
          <View style={[styles.iconWrap, { backgroundColor: `${currentStep.color}15` }]}>
            <Ionicons name={currentStep.icon} size={36} color={currentStep.color} />
          </View>

          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: `${currentStep.color}15` }]}>
            <Text style={[styles.badgeText, { color: currentStep.color }]}>{currentStep.badge}</Text>
          </View>

          {/* Title and Description */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{currentStep.title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{currentStep.description}</Text>

          {/* Navigation Footer */}
          <View style={styles.footer}>
            {/* Dots */}
            <View style={styles.dotsWrap}>
              {STEPS.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setStep(idx + 1)}
                  style={[
                    styles.dot,
                    idx + 1 === step ? [styles.dotActive, { backgroundColor: currentStep.color }] : { backgroundColor: colors.border }
                  ]}
                />
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttons}>
              {step < totalSteps ? (
                <>
                  <TouchableOpacity style={styles.skipTextBtn} onPress={handleSkip}>
                    <Text style={[styles.skipText, { color: colors.textSecondary }]}>Atla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.nextBtn, { backgroundColor: currentStep.color }]} 
                    onPress={handleNext}
                  >
                    <Text style={styles.nextText}>İleri</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={[styles.nextBtn, { backgroundColor: '#10b981', paddingHorizontal: 16 }]} 
                  onPress={handleNext}
                >
                  <Text style={styles.nextText}>Hadi Başlayalım!</Text>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 11, 24, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: width * 0.9,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
  },
  dotsWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 16,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skipTextBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  nextText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
