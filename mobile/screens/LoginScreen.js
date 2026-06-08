import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, StatusBar, Dimensions,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginUser, registerUser } from '../services/api';
import { FONTS, RADIUS } from '../theme/colors';
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

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { themeName, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isLight = themeName === 'light';
  
  const accentColor = colors.accent;
  const accentEnd = GRADIENT_PAIRS[accentColor] || accentColor;
  const tabGradient = [accentColor, accentEnd];
  const bgGradient = isLight ? ['#ddd6fe', '#f0f4ff'] : ['#060b18', '#1a1040'];
  const styles = createStyles(colors, insets, themeName);

  const switchMode = (toRegister) => {
    setIsRegister(toRegister);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Kullanıcı adı ve şifre boş bırakılamaz.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError('Şifreler uyuşmuyor.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let user;
      if (isRegister) {
        user = await registerUser(username.trim(), password.trim(), email.trim() || undefined);
      } else {
        user = await loginUser(username.trim(), password.trim());
      }
      await AsyncStorage.setItem('userId', user._id);
      await AsyncStorage.setItem('username', user.username);
      if (user.token) await AsyncStorage.setItem('token', user.token);
      if (user.refreshToken) await AsyncStorage.setItem('refreshToken', user.refreshToken);
      navigation.replace('Dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Bir hata oluştu';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <LinearGradient
      colors={bgGradient}
      style={styles.container}
    >
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
            {/* Logo Section */}
            <View style={styles.logoContainer}>
               <Text style={[styles.logoText, { color: isLight ? colors.accent : '#818cf8' }]}>VeloPath</Text>
              <Text style={styles.logoSub}>Akıllı Proje Yönetimi ve Verimlilik Asistanı</Text>
            </View>

            {/* Login Card */}
            <View style={styles.loginCard}>
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={styles.tabBtn} 
                  onPress={() => switchMode(false)}
                >
                  {!isRegister ? (
                    <LinearGradient
                      colors={tabGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.activeTabGradient, { shadowColor: colors.accent }]}
                    >
                      <Ionicons name="log-in-outline" size={18} color="#fff" />
                      <Text style={styles.activeTabText}>Giriş Yap</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.inactiveTab}>
                      <Ionicons name="log-in-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.inactiveTabText}>Giriş Yap</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.tabBtn} 
                  onPress={() => switchMode(true)}
                >
                  {isRegister ? (
                    <LinearGradient
                      colors={tabGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.activeTabGradient, { shadowColor: colors.accent }]}
                    >
                      <Ionicons name="person-add-outline" size={18} color="#fff" />
                      <Text style={styles.activeTabText}>Kayıt Ol</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.inactiveTab}>
                      <Ionicons name="person-add-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.inactiveTabText}>Kayıt Ol</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Kullanıcı Adı</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="kullanici_adi"
                      placeholderTextColor={themeName === 'light' ? 'rgba(15,23,42,0.4)' : '#64748b'}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Şifre</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="En az 6 karakter"
                      placeholderTextColor={themeName === 'light' ? 'rgba(15,23,42,0.4)' : '#64748b'}
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
                {/* Hata Mesajı — Inline (web ile aynı) */}
                {!!error && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={16} color={themeName === 'light' ? '#ef4444' : '#f87171'} style={{ marginRight: 8, flexShrink: 0 }} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Şifremi Unuttum (sadece giriş modu) */}
                {!isRegister && (
                  <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginTop: -8 }}>
                    <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>Şifremi Unuttum</Text>
                  </TouchableOpacity>
                )}

                {/* E-posta (sadece kayıt, opsiyonel) */}
                {isRegister && (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>E-posta <Text style={{ opacity: 0.6, fontSize: 12 }}>(opsiyonel — şifre sıfırlama için)</Text></Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="ornek@email.com"
                        placeholderTextColor={themeName === 'light' ? 'rgba(15,23,42,0.4)' : '#64748b'}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                )}
                {/* Şifre Tekrar (sadece kayıt) */}
                {isRegister && (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Şifre Tekrar</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Şifreyi tekrar girin"
                        placeholderTextColor={themeName === 'light' ? 'rgba(15,23,42,0.4)' : '#64748b'}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                      />
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.submitBtnContainer, { shadowColor: colors.accent }]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={tabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitBtn}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons 
                          name={isRegister ? "person-add" : "log-in"} 
                          size={22} 
                          color="#fff" 
                        />
                        <Text style={styles.submitBtnText}>
                          {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.6)" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={14} color={isLight ? colors.accent : colors.textSecondary} />
              </View>
              <Text style={styles.footerText}>Verileriniz şifreli olarak güvende saklanır.</Text>
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
      paddingTop: insets.top + 40,
      paddingBottom: Math.max(insets.bottom, 20) + 10,
      alignItems: 'stretch',
    },
    loginCard: {
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
    logoContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    logoText: {
      fontSize: 44,
      fontWeight: '900',
      letterSpacing: -2,
    },
    logoSub: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      fontWeight: '500',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: isLight ? 'rgba(99, 102, 241, 0.04)' : 'rgba(255, 255, 255, 0.03)',
      borderRadius: 16,
      padding: 6,
      width: '100%',
      marginBottom: 30,
      borderWidth: 1,
      borderColor: isLight ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.08)',
    },
    tabBtn: {
      flex: 1,
      height: 44,
    },
    activeTabGradient: {
      flex: 1,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    activeTabText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
    inactiveTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    inactiveTabText: {
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: 14,
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
      marginTop: 10,
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
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      gap: 10,
    },
    lockBadge: {
      width: 28,
      height: 28,
      backgroundColor: isLight ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.03)',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '500',
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

