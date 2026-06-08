import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar, Dimensions,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const GRADIENT_PAIRS = {
  '#6366f1': '#8b5cf6',
  '#8b5cf6': '#d946ef',
  '#ec4899': '#f43f5e',
  '#f43f5e': '#fb7185',
  '#f97316': '#f59e0b',
  '#f59e0b': '#eab308',
  '#10b981': '#059669',
  '#06b6d4': '#0891b2',
  '#0ea5e9': '#0284c7',
};

export default function ResetPasswordScreen({ navigation }) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const { themeName, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isLight = themeName === 'light';

  const accentColor = colors.accent;
  const accentEnd = GRADIENT_PAIRS[accentColor] || accentColor;
  const btnGradient = [accentColor, accentEnd];
  const bgGradient = isLight ? ['#ddd6fe', '#f0f4ff'] : ['#060b18', '#1a1040'];
  const styles = createStyles(colors, insets, themeName);

  const handleSubmit = async () => {
    if (!token.trim()) {
      setError('Sıfırlama kodu (token) gereklidir.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await resetPassword(token.trim(), password.trim());
      setDone(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Bir hata oluştu. Kod geçersiz olabilir.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={bgGradient} style={styles.container}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            {/* Geri Dön Butonu */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
              <Text style={styles.backBtnText}>Girişe Dön</Text>
            </TouchableOpacity>

            {/* Başlık */}
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, { color: isLight ? colors.accent : '#818cf8' }]}>
                {done ? 'Şifre Güncellendi!' : 'Yeni Şifre Belirle'}
              </Text>
              <Text style={styles.headerSub}>
                {done
                  ? 'Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...'
                  : 'En az 6 karakter uzunluğunda yeni bir şifre seçin.'}
              </Text>
            </View>

            {/* İçerik Kartı */}
            <View style={styles.card}>
              {done ? (
                <View style={styles.sentContainer}>
                  <Ionicons name="checkmark-circle" size={64} color={colors.success} style={{ marginBottom: 16 }} />
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              ) : (
                <View style={styles.form}>
                  {/* Sıfırlama Kodu Girişi */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Sıfırlama Kodu (Token)</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="key-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="E-postadaki 64 haneli kodu girin"
                        placeholderTextColor={isLight ? 'rgba(15,23,42,0.4)' : '#64748b'}
                        value={token}
                        onChangeText={setToken}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  {/* Yeni Şifre */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Yeni Şifre</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="En az 6 karakter"
                        placeholderTextColor={isLight ? 'rgba(15,23,42,0.4)' : '#64748b'}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons 
                          name={showPassword ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color={colors.textSecondary} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Şifre Tekrar */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Şifre Tekrar</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Yeni şifreyi tekrar girin"
                        placeholderTextColor={isLight ? 'rgba(15,23,42,0.4)' : '#64748b'}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                      />
                    </View>
                  </View>

                  {/* Hata Mesajı */}
                  {!!error && (
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle-outline" size={16} color={isLight ? '#ef4444' : '#f87171'} style={{ marginRight: 8, flexShrink: 0 }} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.submitBtnContainer, { shadowColor: colors.accent, marginTop: 10 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={btnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitBtn}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                          <Text style={styles.submitBtnText}>Şifremi Güncelle</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const createStyles = (colors, insets, themeName) => {
  const isLight = themeName === 'light';
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    inner: {
      width: '100%',
      paddingHorizontal: 24,
      paddingTop: insets.top + 20,
      paddingBottom: Math.max(insets.bottom, 20) + 10,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 30,
    },
    backBtnText: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    headerText: {
      fontSize: 32,
      fontWeight: '900',
      letterSpacing: -1,
      textAlign: 'center',
    },
    headerSub: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      fontWeight: '500',
      lineHeight: 20,
      paddingHorizontal: 10,
    },
    card: {
      width: '100%',
      backgroundColor: isLight ? '#ffffff' : 'transparent',
      borderWidth: isLight ? 1 : 0,
      borderColor: isLight ? 'rgba(99,102,241,0.15)' : 'transparent',
      borderRadius: 28,
      padding: isLight ? 24 : 0,
      marginBottom: 20,
      shadowColor: isLight ? 'rgba(99,102,241,0.15)' : 'transparent',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: isLight ? 0.15 : 0,
      shadowRadius: 30,
      elevation: isLight ? 10 : 0,
    },
    form: {
      width: '100%',
      gap: 20,
    },
    inputWrapper: {
      gap: 8,
    },
    label: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'left',
      paddingLeft: 4,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isLight ? 'rgba(99, 102, 241, 0.03)' : 'rgba(255, 255, 255, 0.02)',
      borderRadius: 18,
      paddingHorizontal: 16,
      height: 60,
      borderWidth: 1,
      borderColor: isLight ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.08)',
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '500',
    },
    submitBtnContainer: {
      borderRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    submitBtn: {
      height: 58,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    submitBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    sentContainer: {
      alignItems: 'center',
      paddingVertical: 30,
      gap: 16,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isLight ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.12)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.25)',
    },
    errorText: {
      color: isLight ? '#ef4444' : '#f87171',
      fontSize: 13,
      fontWeight: '500',
      flex: 1,
    },
  });
};
