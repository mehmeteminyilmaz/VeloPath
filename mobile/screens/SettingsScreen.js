import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Versiyon</Text>
            <Text style={styles.settingValue}>1.0.0 (Web Sync)</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Tema</Text>
            <Text style={styles.settingValue}>Midnight (Koyu)</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
          <Text style={styles.logoutText}>Oturumu Kapat</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { padding: 8, marginLeft: -10, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  content: { padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { color: COLORS.accent, fontSize: 14, fontWeight: '700', marginBottom: 15, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  settingLabel: { color: '#ccc', fontSize: 16 },
  settingValue: { color: '#666', fontSize: 14 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, padding: 15, backgroundColor: 'rgba(248, 113, 113, 0.1)', borderRadius: 12 },
  logoutText: { color: '#f87171', fontSize: 16, fontWeight: '600' },
});
