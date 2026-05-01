import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert, RefreshControl, ScrollView, TextInput, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllData, deleteProjectAPI } from '../services/api';
import { SHADOW } from '../theme/colors';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Aktif');
  const [priorityFilter, setPriorityFilter] = useState('Tümü');

  const { themeName, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets);

  const loadData = useCallback(async (uid) => {
    try {
      const data = await fetchAllData(uid);
      if (data) setProjects(data);
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const uid = await AsyncStorage.getItem('userId');
      const name = await AsyncStorage.getItem('username');
      setUsername(name || 'Kullanıcı');
      if (uid) loadData(uid);
    };
    init();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    AsyncStorage.getItem('userId').then(uid => loadData(uid));
  };

  const handleDelete = (id) => {
    Alert.alert('Projeyi Sil', 'Bu projeyi silmek istediğine emin misin?', [
      { text: 'İptal' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          await deleteProjectAPI(id);
          onRefresh();
        }
      }
    ]);
  };

  // Web Style Summary Cards
  const renderSummary = () => {
    const stats = [
      { label: 'Aktif Projeler', value: projects.length, icon: 'briefcase-outline', color: colors.accent },
      { label: 'Bekleyen Görevler', value: '0', icon: 'pulse-outline', color: colors.success },
      { label: 'Tamamlananlar', value: '0', icon: 'checkmark-done-outline', color: '#8b5cf6' },
      { label: 'Verimlilik', value: '%0', icon: 'pie-chart-outline', color: colors.warning },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.summaryScroll}
        contentContainerStyle={styles.summaryScrollContent}
      >
        {stats.map((s, i) => (
          <View key={i} style={styles.summaryCard}>
            <View style={[styles.summaryIconBox, { backgroundColor: `${s.color}15` }]}>
              <Ionicons name={s.icon} size={20} color={s.color} />
            </View>
            <Text style={styles.summaryLabel}>{s.label}</Text>
            <Text style={styles.summaryValue}>{s.value}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navigation={navigation}
        currentRoute="Dashboard"
      />

      {/* Header - Web Style */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSidebarOpen(true)}>
          <Ionicons name="menu-outline" size={30} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kontrol Paneli</Text>
        <View style={styles.headerRight}>
          <View style={styles.onlineDot} />
        </View>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListHeaderComponent={
          <>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Hoş Geldin, {username}!</Text>
              <Text style={styles.subText}>Bugün neler yapıyoruz?</Text>
            </View>

            {renderSummary()}

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="briefcase" size={18} color={colors.accent} />
                <Text style={styles.sectionTitle}>Projelerim</Text>
              </View>
              <View style={styles.filterRow}>
                <TouchableOpacity style={[styles.filterBtn, activeFilter === 'Aktif' && styles.activeFilterBtn]}>
                  <Text style={[styles.filterText, activeFilter === 'Aktif' && styles.activeFilterText]}>Aktif</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterBtn}>
                  <Text style={styles.filterText}>Arşiv</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  placeholder="Proje ara (başlık veya açıklama)..."
                  placeholderTextColor={colors.textSecondary}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priorityScroll}>
              <Text style={styles.priorityLabel}>Öncelik :</Text>
              {['Tümü', 'Yüksek', 'Orta', 'Düşük'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityBtn, priorityFilter === p && styles.activePriorityBtn]}
                  onPress={() => setPriorityFilter(p)}
                >
                  <Text style={[styles.priorityBtnText, priorityFilter === p && styles.activePriorityText]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.projectCard, { borderLeftColor: item.color || colors.accent }]}
            onPress={() => navigation.navigate('ProjectDetails', {
              projectId: item._id || item.id,
              projectTitle: item.title,
              projectColor: item.color || colors.accent
            })}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleBox}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>DEVAM EDİYOR</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleDelete(item._id || item.id)}>
                  <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.cardInfo}>0 / 0 Görev Tamamlandı</Text>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '5%', backgroundColor: item.color || colors.accent }]} />
            </View>
            <Text style={styles.progressPercent}>%0</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Pomodoro')}
      >
        <Ionicons name="timer-outline" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: insets.top + 10,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  headerRight: { width: 30, alignItems: 'flex-end' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },

  welcomeSection: { paddingHorizontal: 20, marginTop: 10 },
  welcomeText: { color: colors.accent, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subText: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },

  summaryScroll: { marginTop: 25, marginBottom: 10 },
  summaryScrollContent: { paddingLeft: 20, paddingRight: 20 },
  summaryCard: { width: 130, backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginRight: 12, borderWidth: 1, borderColor: colors.border },
  summaryIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  summaryLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  summaryValue: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 30 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  filterRow: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 10, padding: 4 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  activeFilterBtn: { backgroundColor: `${colors.accent}15` },
  filterText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  activeFilterText: { color: colors.accent },

  searchSection: { paddingHorizontal: 20, marginTop: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 12, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, marginLeft: 10, color: colors.textPrimary, fontSize: 14 },

  priorityScroll: { paddingLeft: 20, marginTop: 20, marginBottom: 10 },
  priorityLabel: { color: colors.textSecondary, fontSize: 13, marginRight: 15, alignSelf: 'center' },
  priorityBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, marginRight: 8 },
  activePriorityBtn: { backgroundColor: colors.accent },
  priorityBtnText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  activePriorityText: { color: '#fff' },

  listContent: { paddingBottom: 100 },
  projectCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardTitleBox: { flex: 1 },
  cardTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 6 },
  statusBadge: { backgroundColor: `${colors.warning}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  statusText: { color: colors.warning, fontSize: 9, fontWeight: '900' },
  cardActions: { flexDirection: 'row', gap: 15 },

  cardInfo: { color: colors.textSecondary, fontSize: 12, marginBottom: 12 },
  progressBarBg: { height: 4, backgroundColor: `${colors.textSecondary}15`, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  progressPercent: { color: colors.danger, fontSize: 10, fontWeight: '800', alignSelf: 'flex-end', marginTop: 6 },

  fab: {
    position: 'absolute',
    bottom: 30, right: 25,
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
