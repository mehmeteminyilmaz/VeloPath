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
import { forgotPassword } from '../services/api';
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

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
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
    if (!email.trim()) {
      setError('E-posta adresi boş bırakılamaz.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Bir hata oluştu';
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
              <Text style={styles.backBtnText}>Girişe Dön</Text>
            </TouchableOpacity>

            {/* Başlık */}
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, { color: isLight ? colors.accent : '#818cf8' }]}>
                {sent ? 'E-posta Gönderildi' : 'Şifremi Unuttum'}
              </Text>
              <Text style={styles.headerSub}>
                {sent
                  ? `${email} adresine şifre sıfırlama kodu gönderdik. E-postanızı kontrol edin.`
                  : 'Hesabınıza kayıtlı e-posta adresinizi girin, şifre sıfırlama linki gönderelim.'}
              </Text>
            </View>

            {/* İçerik Kartı */}
            <View style={styles.card}>
              {sent ? (
                <View style={styles.sentContainer}>
                  <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} style={{ marginBottom: 16 }} />
                  <Text style={styles.sentInfo}>Gelen kutunuzu (ve spam klasörünü) kontrol etmeyi unutmayın. Link 1 saat geçerlidir.</Text>
                  
                  <TouchableOpacity
                    style={[styles.submitBtnContainer, { shadowColor: colors.accent, marginTop: 20 }]}
                    onPress={() => navigation.navigate('ResetPassword')}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={btnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitBtn}
                    >
                      <Ionicons name="key-outline" size={20} color="#fff" />
                      <Text style={styles.submitBtnText}>Sıfırlama Kodunu Gir</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.form}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>E-posta Adresi</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="ornek@email.com"
                        placeholderTextColor={isLight ? 'rgba(15,23,42,0.4)' : '#64748b'}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus
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
                          <Ionicons name="paper-plane-outline" size={20} color="#fff" />
                          <Text style={styles.submitBtnText}>Sıfırlama Linki Gönder</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Manuel Reset Butonu */}
                  <TouchableOpacity
                    style={styles.manualLink}
                    onPress={() => navigation.navigate('ResetPassword')}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 13, textDecorationLine: 'underline' }}>
                      Zaten kodunuz var mı? Şifrenizi sıfırlayın.
                    </Text>
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
      paddingVertical: 10,
    },
    sentInfo: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
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
    manualLink: {
      alignItems: 'center',
      marginTop: 10,
    },
  });
};
