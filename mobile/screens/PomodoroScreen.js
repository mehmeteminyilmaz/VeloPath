import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Easing, Vibration, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const MODES = [
  { key: 'pomodoro', label: 'Odaklanma', minutes: 25, color: '#6366f1' },
  { key: 'short',   label: 'Kısa Mola', minutes: 5,  color: '#10b981' },
  { key: 'long',    label: 'Uzun Mola', minutes: 15, color: '#f59e0b' },
];

export default function PomodoroScreen({ navigation }) {
  const { colors, themeName } = useTheme();
  const insets = useSafeAreaInsets();

  const [modeIdx, setModeIdx]     = useState(0);
  const [minutes, setMinutes]     = useState(MODES[0].minutes);
  const [seconds, setSeconds]     = useState(0);
  const [isActive, setIsActive]   = useState(false);
  const [sessions, setSessions]   = useState(0);
  const [finished, setFinished]   = useState(false);

  // Döngüsel animasyon için
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const rotationRef = useRef(null);

  const currentMode  = MODES[modeIdx];
  const totalSeconds = currentMode.minutes * 60;
  const elapsed      = totalSeconds - (minutes * 60 + seconds);
  const progress     = totalSeconds > 0 ? elapsed / totalSeconds : 0;

  // Dönen halka animasyonu
  useEffect(() => {
    if (isActive) {
      rotationRef.current = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationRef.current.start();
    } else {
      if (rotationRef.current) rotationRef.current.stop();
    }
    return () => { if (rotationRef.current) rotationRef.current.stop(); };
  }, [isActive, rotateAnim]);

  // Pulse animasyonu — bitince
  useEffect(() => {
    if (finished) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [finished, pulseAnim]);

  // Zamanlayıcı
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev > 0) return prev - 1;
        setMinutes(m => {
          if (m > 0) return m - 1;
          // Bitti
          clearInterval(interval);
          setIsActive(false);
          setFinished(true);
          if (modeIdx === 0) setSessions(s => s + 1);
          if (Platform.OS !== 'web') Vibration.vibrate([0, 400, 200, 400]);
          return 0;
        });
        return 59;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, modeIdx]);

  const handleToggle = () => {
    setFinished(false);
    setIsActive(a => !a);
  };

  const handleReset = useCallback(() => {
    setIsActive(false);
    setFinished(false);
    setMinutes(currentMode.minutes);
    setSeconds(0);
  }, [currentMode]);

  const handleModeChange = (idx) => {
    setIsActive(false);
    setFinished(false);
    setModeIdx(idx);
    setMinutes(MODES[idx].minutes);
    setSeconds(0);
  };

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // SVG benzeri daire progress (basit border ile)
  const ringColor = finished ? colors.success : currentMode.color;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Pomodoro</Text>
        <View style={styles.sessionBadge}>
          <Ionicons name="flame" size={16} color={currentMode.color} />
          <Text style={[styles.sessionText, { color: currentMode.color }]}>{sessions}</Text>
        </View>
      </View>

      {/* Mod Seçici */}
      <View style={[styles.modeBar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        {MODES.map((m, i) => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.modeBtn,
              modeIdx === i && { backgroundColor: m.color }
            ]}
            onPress={() => handleModeChange(i)}
          >
            <Text style={[
              styles.modeBtnText,
              { color: modeIdx === i ? '#fff' : colors.textSecondary }
            ]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Zamanlayıcı Çemberi */}
      <View style={styles.timerArea}>
        {/* Dönen çerçeve */}
        <Animated.View style={[
          styles.spinRing,
          {
            borderColor: isActive ? `${ringColor}40` : 'transparent',
            transform: [{ rotate: spin }]
          }
        ]} />

        {/* Ana pulse çemberi */}
        <Animated.View style={[
          styles.timerCircle,
          {
            backgroundColor: colors.bgCard,
            borderColor: ringColor,
            borderWidth: 4,
            shadowColor: ringColor,
            transform: [{ scale: pulseAnim }]
          }
        ]}>
          {/* İlerleme göstergesi (basit overlay arc) */}
          <View style={[
            styles.progressArc,
            {
              borderColor: colors.border,
              borderTopColor: finished ? colors.success : progress > 0 ? ringColor : colors.border,
            }
          ]} />

          <View style={styles.timerInner}>
            {finished ? (
              <>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                <Text style={[styles.doneText, { color: colors.success }]}>
                  {modeIdx === 0 ? 'Tebrikler!' : 'Mola bitti!'}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.timerText, { color: colors.textPrimary }]}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </Text>
                <Text style={[styles.modeLabel, { color: ringColor }]}>
                  {currentMode.label}
                </Text>
              </>
            )}
          </View>
        </Animated.View>
      </View>

      {/* Kontroller */}
      <View style={styles.controls}>
        {/* Reset */}
        <TouchableOpacity
          style={[styles.ctrlBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={handleReset}
        >
          <Ionicons name="refresh" size={26} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Play/Pause — Ana buton */}
        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: ringColor, shadowColor: ringColor }]}
          onPress={handleToggle}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isActive ? 'pause' : 'play'}
            size={36}
            color="#fff"
            style={{ marginLeft: isActive ? 0 : 4 }}
          />
        </TouchableOpacity>

        {/* Skip — Sonraki moda geç */}
        <TouchableOpacity
          style={[styles.ctrlBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => handleModeChange((modeIdx + 1) % MODES.length)}
        >
          <Ionicons name="play-skip-forward" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Bilgi kartı */}
      <View style={[styles.infoCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <View style={[styles.infoIconBox, { backgroundColor: `${currentMode.color}15` }]}>
          <Ionicons name="bulb-outline" size={20} color={currentMode.color} />
        </View>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {modeIdx === 0
            ? `${sessions > 0 ? `${sessions} oturum tamamlandı. ` : ''}25 dakika odaklan, sonra mola ver.`
            : modeIdx === 1
            ? 'Kısa molada gözlerini dinlendir ve esneme yap.'
            : 'Uzun molada bir şeyler iç, hareket et.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  sessionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionText: { fontWeight: '800', fontSize: 16 },

  modeBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeBtnText: { fontSize: 13, fontWeight: '700' },

  timerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
    height: 280,
  },
  spinRing: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  progressArc: {
    position: 'absolute',
    width: 232,
    height: 232,
    borderRadius: 116,
    borderWidth: 4,
    top: 0,
    left: 0,
  },
  timerInner: { alignItems: 'center', gap: 6 },
  timerText: { fontSize: 64, fontWeight: '200', letterSpacing: -2 },
  modeLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 },
  doneText: { fontSize: 18, fontWeight: '800', marginTop: 4 },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  ctrlBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 40,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
