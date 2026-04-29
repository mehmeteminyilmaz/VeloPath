import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, StatusBar, 
  ScrollView, Alert, Switch, Modal, TextInput, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { updateUsername } from '../services/api';

export default function SettingsScreen({ navigation }) {
  const [username, setUsername] = useState('Misafir');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { themeName, colors, toggleTheme } = useTheme();

  // Modal States
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const storedUser = await AsyncStorage.getItem('username');
      if (storedUser) {
        setUsername(storedUser);
        setNewName(storedUser);
      }
    };
    loadUserData();
  }, []);

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Hata', 'İsim boş olamaz.');
      return;
    }

    setIsUpdating(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const updatedUser = await updateUsername(userId, newName.trim());
      
      await AsyncStorage.setItem('username', updatedUser.username);
      setUsername(updatedUser.username);
      setIsNameModalOpen(false);
      Alert.alert('Başarılı', 'Profil isminiz güncellendi.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Güncelleme başarısız.';
      Alert.alert('Hata', msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Oturumu Kapat",
      "Çıkış yapmak istediğinizden emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Çıkış Yap", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      "Verileri Sıfırla",
      "Tüm verileriniz silinecek ve oturumunuz kapatılacak. Bu işlem geri alınamaz!",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Sıfırla", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={{ width: 40 }} /> {/* Balancer */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* --- PROFIL BÖLÜMÜ --- */}
        <Text style={styles.sectionTitle}>PROFİL</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{username[0].toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.usernameText}>{username}</Text>
            <Text style={styles.memberTypeText}>Standart Üye</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setIsNameModalOpen(true)}>
            <Ionicons name="pencil-outline" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* --- TERCİHLER BÖLÜMÜ --- */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>TERCİHLER</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.accent}15` }]}>
                <Ionicons name="notifications-outline" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Bildirimler</Text>
                <Text style={styles.settingSubLabel}>Önemli hatırlatıcılar</Text>
              </View>
            </View>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#333', true: colors.accent }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Ionicons name="moon-outline" size={20} color="#8b5cf6" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Görünüm Teması</Text>
                <Text style={styles.settingSubLabel}>{themeName === 'dark' ? 'Karanlık Mod' : 'Aydınlık Mod'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggleBtn}>
              <Text style={styles.themeValue}>{themeName === 'dark' ? 'Aydınlık Yap' : 'Karanlık Yap'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="language-outline" size={20} color={colors.success} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Dil</Text>
                <Text style={styles.settingSubLabel}>Türkçe</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </View>
        </View>

        {/* --- TEHLİKELİ BÖLGE --- */}
        <Text style={[styles.sectionTitle, { marginTop: 30, color: colors.danger }]}>TEHLİKELİ BÖLGE</Text>
        <View style={[styles.settingsGroup, { borderColor: `${colors.danger}20` }]}>
          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.danger}15` }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.danger }]}>Oturumu Kapat</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} onPress={handleResetData}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.danger}15` }]}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.danger }]}>Tüm Verileri Sıfırla</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.footerText}>VeloPath Mobile v2.4.0</Text>
          </View>
          <View style={styles.footerRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={[styles.footerText, { color: colors.success }]}>Tüm sistemler çalışıyor</Text>
          </View>
        </View>

      </ScrollView>

      {/* --- NAME UPDATE MODAL --- */}
      <Modal
        visible={isNameModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNameModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>İsmi Güncelle</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Yeni isminizi girin"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setIsNameModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveBtn} 
                onPress={handleUpdateName}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.bg 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 15, 
    paddingTop: 55, 
    paddingBottom: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  backBtn: { 
    padding: 8, 
    borderRadius: 12,
    backgroundColor: `${colors.textPrimary}05`
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: colors.textPrimary,
    letterSpacing: -0.5
  },
  content: { 
    padding: 20,
    paddingBottom: 50
  },
  sectionTitle: { 
    color: colors.textSecondary, 
    fontSize: 12, 
    fontWeight: '700', 
    marginBottom: 12, 
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingLeft: 4
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4
  },
  memberTypeText: {
    fontSize: 13,
    color: colors.textSecondary
  },
  editBtn: {
    padding: 10,
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12
  },
  settingsGroup: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600'
  },
  settingSubLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  themeValue: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: 14
  },
  themeToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${colors.accent}10`,
    borderRadius: 8
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 10
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 20
  },
  modalInput: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12
  },
  modalCancelBtn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '700'
  },
  modalSaveBtn: {
    flex: 2,
    backgroundColor: colors.accent,
    padding: 16,
    alignItems: 'center',
    borderRadius: 16
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '800'
  }
});
