import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, StatusBar, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginUser, registerUser } from '../services/api';
import { FONTS, RADIUS } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
      navigation.replace('Dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Bir hata oluştu';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors, insets);

  const handleForgotPassword = () => {
    Alert.alert(
      'Şifremi Unuttum',
      'Şifrenizi sıfırlamak için web uygulaması üzerinden "Unuttum" seçeneğini kullanın ya da hesabınızı kayıt sırasında girdiğiniz e-posta adresiyle sıfırlayın.',
      [{ text: 'Tamam' }]
    );
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e1b4b']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.inner}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { color: '#818cf8' }]}>VeloPath</Text>
            <Text style={styles.logoSub}>Akıllı Proje Yönetimi ve Verimlilik Asistanı</Text>
          </View>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={styles.tabBtn} 
              onPress={() => switchMode(false)}
            >
              {!isRegister ? (
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeTabGradient}
                >
                  <Ionicons name="log-in-outline" size={18} color="#fff" />
                  <Text style={styles.activeTabText}>Giriş Yap</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <Ionicons name="log-in-outline" size={18} color="#64748b" />
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
                  colors={['#6366f1', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeTabGradient}
                >
                  <Ionicons name="person-add-outline" size={18} color="#fff" />
                  <Text style={styles.activeTabText}>Kayıt Ol</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <Ionicons name="person-add-outline" size={18} color="#64748b" />
                  <Text style={styles.inactiveTabText}>Kayıt Ol</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Kullanıcı Adı</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="kullanici_adi"
                  placeholderTextColor="#475569"
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
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="En az 6 karakter"
                  placeholderTextColor="#475569"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* Hata Mesajı — Inline (web ile aynı) */}
            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#f87171" style={{ marginRight: 8, flexShrink: 0 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Şifremi Unuttum (sadece giriş modu) */}
            {!isRegister && (
              <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginTop: -8 }}>
                <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '600' }}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            )}

            {/* E-posta (sadece kayıt, opsiyonel) */}
            {isRegister && (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>E-posta <Text style={{ opacity: 0.6, fontSize: 12 }}>(opsiyonel — şifre sıfırlama için)</Text></Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ornek@email.com"
                    placeholderTextColor="#475569"
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
                  <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Şifreyi tekrar girin"
                    placeholderTextColor="#475569"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>
            )}
            <TouchableOpacity
              style={styles.submitBtnContainer}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
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
          <View style={styles.footer}>
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color="#475569" />
            </View>
            <Text style={styles.footerText}>Verileriniz şifreli olarak güvende saklanır.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: insets.top + 60,
    paddingBottom: insets.bottom + 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoSub: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 6,
    width: '100%',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    shadowColor: '#6366f1',
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
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  form: {
    width: '100%',
    gap: 24,
  },
  inputWrapper: {
    gap: 12,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  submitBtnContainer: {
    marginTop: 10,
    borderRadius: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  submitBtn: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    gap: 10,
  },
  lockBadge: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});

