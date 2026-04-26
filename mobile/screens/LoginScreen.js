import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/api';
import { COLORS, FONTS, RADIUS } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre boş bırakılamaz.');
      return;
    }
    setLoading(true);
    try {
      let user;
      if (isRegister) {
        user = await registerUser(username.trim(), password.trim());
      } else {
        user = await loginUser(username.trim(), password.trim());
      }
      await AsyncStorage.setItem('userId', user._id);
      await AsyncStorage.setItem('username', user.username);
      navigation.replace('Dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Bir hata oluştu';
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoEmoji}>⚡</Text>
        </View>
        <Text style={styles.logoText}>VeloPath</Text>
        <Text style={styles.logoSub}>Proje yönetimi, her platformda</Text>
      </View>

      {/* Kart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="kullanici_adi"
            placeholderTextColor={COLORS.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => setIsRegister(!isRegister)}
        >
          <Text style={styles.switchText}>
            {isRegister
              ? 'Zaten hesabın var mı? Giriş yap'
              : 'Hesabın yok mu? Kayıt ol'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sync badge */}
      <View style={styles.syncBadge}>
        <Text style={styles.syncDot}>●</Text>
        <Text style={styles.syncText}>Web ile gerçek zamanlı senkronize</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoEmoji: {
    fontSize: 36,
  },
  logoText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  switchBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  switchText: {
    color: COLORS.accentLight,
    fontSize: FONTS.sizes.sm,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 6,
  },
  syncDot: {
    color: COLORS.success,
    fontSize: 10,
  },
  syncText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
});
