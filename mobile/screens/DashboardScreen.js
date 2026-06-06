import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, Alert, RefreshControl, ScrollView, TextInput, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllData, deleteProjectAPI, updateProjectAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
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
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'kanban'

  const { themeName, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets);

  const loadData = useCallback(async (uid) => {
    try {
      const data = await fetchAllData(uid);
      if (data) setProjects(data);
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
      // Eger token gecersiz veya suresi dolmussa (401), kullaniciyi Login ekranina atalim
      if (err.response && err.response.status === 401) {
        Alert.alert('Oturum Kapandı', 'Lütfen güvenliğiniz için tekrar giriş yapın.', [
          {
            text: 'Tamam', onPress: async () => {
              await AsyncStorage.multiRemove(['userId', 'username', 'token']);
              navigation.replace('Login');
            }
          }
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => {
    const init = async () => {
      const uid = await AsyncStorage.getItem('userId');
      const name = await AsyncStorage.getItem('username');
      setUsername(name || 'Kullanıcı');
      if (uid) loadData(uid);
    };
    init();
  }, [loadData]);

  // Socket.io — Merkezi socket servisi üzerinden gerçek zamanlı güncelleme
  useEffect(() => {
    AsyncStorage.getItem('userId').then(uid => {
      if (!uid) return;
      connectSocket(uid, () => loadData(uid));
    });
    return () => disconnectSocket();
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

  // Görev tamamlanma kontrolü — backend hem completed hem status döndürebilir
  const isTaskDone = (t) => t.completed === true || t.status === 'done';

  const handleArchive = async (projectId, isCurrentlyArchived) => {
    try {
      await updateProjectAPI(projectId, { archived: !isCurrentlyArchived });
      onRefresh();
    } catch (err) {
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
    }
  };

  // Projeleri filtrele
  const filteredProjects = projects
    .filter(p => activeFilter === 'Aktif' ? !p.archived : !!p.archived)
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    })
    .filter(p => {
      if (priorityFilter === 'Tümü') return true;
      return p.priority === priorityFilter;
    });

  // Summary kartları için gerçek istatistikler
  const renderSummary = () => {
    const activeProjects = projects.filter(p => !p.archived);
    const allTasks = projects.flatMap(p => p.tasks || []);
    const completedTasks = allTasks.filter(isTaskDone);
    const pendingTasks = allTasks.filter(t => !isTaskDone(t));
    const productivity = allTasks.length > 0
      ? Math.round((completedTasks.length / allTasks.length) * 100)
      : 0;

    const stats = [
      { label: 'Aktif Projeler', value: activeProjects.length.toString(), icon: 'briefcase-outline', color: colors.accent },
      { label: 'Bekleyen Görevler', value: pendingTasks.length.toString(), icon: 'pulse-outline', color: colors.success },
      { label: 'Tamamlananlar', value: completedTasks.length.toString(), icon: 'checkmark-done-outline', color: '#8b5cf6' },
      { label: 'Verimlilik', value: `%${productivity}`, icon: 'pie-chart-outline', color: colors.warning },
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

  const getProjectProgress = (project) => {
    const tasks = project.tasks || [];
    const completedCount = tasks.filter(t => t.completed === true || t.status === 'done').length;
    return tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  };

  const getKanbanCol = (project) => {
    const completed = (project.tasks || []).filter(t => t.completed === true || t.status === 'done').length;
    const total = (project.tasks || []).length;
    if (total === 0 || completed === 0) return 'todo';
    if (completed === total) return 'done';
    return 'doing';
  };

  const renderKanbanCard = (project) => {
    const tasks = project.tasks || [];
    const completedCount = tasks.filter(isTaskDone).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
    const projectId = project._id || project.id;

    return (
      <TouchableOpacity
        key={projectId}
        style={[styles.kanbanCard, { borderLeftColor: project.color || colors.accent }]}
        onPress={() => navigation.navigate('ProjectDetails', {
          projectId,
          projectTitle: project.title,
          projectColor: project.color || colors.accent
        })}
        activeOpacity={0.8}
      >
        <Text style={styles.kanbanCardTitle} numberOfLines={1}>{project.title}</Text>
        <Text style={styles.kanbanCardInfo}>{completedCount} / {tasks.length} Görev</Text>
        
        <View style={styles.kanbanProgressBarBg}>
          <View style={[styles.kanbanProgressBarFill, {
            width: `${Math.max(progress, progress > 0 ? 2 : 0)}%`,
            backgroundColor: project.color || colors.accent
          }]} />
        </View>
        <Text style={[styles.kanbanProgressPercent, { color: progress === 100 ? colors.success : colors.warning }]}>%{progress}</Text>
      </TouchableOpacity>
    );
  };

  const renderKanbanBoard = () => {
    const todoProjects = filteredProjects.filter(p => getKanbanCol(p) === 'todo');
    const doingProjects = filteredProjects.filter(p => getKanbanCol(p) === 'doing');
    const doneProjects = filteredProjects.filter(p => getKanbanCol(p) === 'done');

    const columns = [
      { key: 'todo', label: 'Yapılacak', color: '#f59e0b', icon: '📋', projects: todoProjects },
      { key: 'doing', label: 'Devam Eden', color: '#3b82f6', icon: '⚡', projects: doingProjects },
      { key: 'done', label: 'Tamamlandı', color: '#10b981', icon: '✅', projects: doneProjects },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kanbanScrollContent}
        snapToInterval={width * 0.78 + 12}
        decelerationRate="fast"
      >
        {columns.map(col => (
          <View key={col.key} style={styles.kanbanColumn}>
            <View style={[styles.kanbanColHeader, { borderBottomColor: col.color }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>{col.icon}</Text>
                <Text style={styles.kanbanColTitle}>{col.label}</Text>
              </View>
              <View style={[styles.kanbanColCountBadge, { backgroundColor: `${col.color}20` }]}>
                <Text style={[styles.kanbanColCountText, { color: col.color }]}>{col.projects.length}</Text>
              </View>
            </View>

            <ScrollView
              style={styles.kanbanColBody}
              contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {col.projects.length > 0 ? (
                col.projects.map(renderKanbanCard)
              ) : (
                <View style={styles.kanbanEmptyCol}>
                  <Text style={styles.kanbanEmptyColText}>Proje Yok</Text>
                </View>
              )}
            </ScrollView>
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
          <TouchableOpacity onPress={() => navigation.navigate('GlobalSearch')} style={{ marginRight: 15 }}>
            <Ionicons name="search-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CreateProject')} style={{ marginRight: 15 }}>
            <Ionicons name="add-circle-outline" size={26} color={colors.accent} />
          </TouchableOpacity>
          <View style={styles.onlineDot} />
        </View>
      </View>

      <FlatList
        data={layoutMode === 'kanban' && activeFilter === 'Aktif' ? [] : filteredProjects}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListHeaderComponent={
          <>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Hoş Geldin, {username}</Text>
              <Text style={styles.subText}>Bugün neler yapıyoruz?</Text>
            </View>

            {renderSummary()}

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="briefcase" size={18} color={colors.accent} />
                <Text style={styles.sectionTitle}>Projelerim</Text>
              </View>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterBtn, activeFilter === 'Aktif' && styles.activeFilterBtn]}
                  onPress={() => setActiveFilter('Aktif')}
                >
                  <Text style={[styles.filterText, activeFilter === 'Aktif' && styles.activeFilterText]}>Aktif</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterBtn, activeFilter === 'Arşiv' && styles.activeFilterBtn]}
                  onPress={() => setActiveFilter('Arşiv')}
                >
                  <Text style={[styles.filterText, activeFilter === 'Arşiv' && styles.activeFilterText]}>Arşiv</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Grid / Kanban layout selector (Only active projects) */}
            {activeFilter === 'Aktif' && (
              <View style={styles.layoutToggleContainer}>
                <View style={styles.layoutBtnGroup}>
                  <TouchableOpacity
                    style={[styles.layoutBtn, layoutMode === 'grid' && styles.layoutBtnActive]}
                    onPress={() => setLayoutMode('grid')}
                  >
                    <Ionicons name="grid-outline" size={15} color={layoutMode === 'grid' ? colors.accent : colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.layoutBtnText, layoutMode === 'grid' && { color: colors.accent, fontWeight: 'bold' }]}>Izgara</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.layoutBtn, layoutMode === 'kanban' && styles.layoutBtnActive]}
                    onPress={() => setLayoutMode('kanban')}
                  >
                    <Ionicons name="albums-outline" size={15} color={layoutMode === 'kanban' ? colors.accent : colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.layoutBtnText, layoutMode === 'kanban' && { color: colors.accent, fontWeight: 'bold' }]}>Kanban</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Öncelik Filtreleri — web ile aynı */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 14 }}
              contentContainerStyle={styles.priorityFilterRow}
            >
              {['Tümü', 'Yüksek', 'Orta', 'Düşük'].map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriorityFilter(p)}
                  style={[
                    styles.priorityPill,
                    priorityFilter === p && styles.priorityPillActive,
                    priorityFilter === p && p === 'Yüksek' && { backgroundColor: colors.danger },
                    priorityFilter === p && p === 'Orta'  && { backgroundColor: colors.warning },
                    priorityFilter === p && p === 'Düşük' && { backgroundColor: colors.success },
                    priorityFilter === p && p === 'Tümü'  && { backgroundColor: colors.accent },
                  ]}
                >
                  <Text style={[
                    styles.priorityPillText,
                    priorityFilter === p && styles.priorityPillTextActive,
                  ]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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
          </>
        }
        ListEmptyComponent={
          (layoutMode === 'kanban' && activeFilter === 'Aktif')
            ? null
            : (!loading ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconWrap}>
                    <Ionicons
                      name={activeFilter === 'Aktif' ? 'folder-open-outline' : 'archive-outline'}
                      size={44}
                      color={colors.accent}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {activeFilter === 'Aktif' ? 'Henüz Aktif Projeniz Yok' : 'Arşivde Proje Bulunmuyor'}
                  </Text>
                  <Text style={styles.emptyDesc}>
                    {activeFilter === 'Aktif'
                      ? 'Hayallerinizi gerçekleştirmek için ilk adımınızı atın!'
                      : 'Arşivlediğiniz projeler burada görünecektir.'}
                  </Text>
                  {activeFilter === 'Aktif' && (
                    <TouchableOpacity
                      style={[styles.emptyBtn, { backgroundColor: colors.accent }]}
                      onPress={() => navigation.navigate('CreateProject')}
                    >
                      <Ionicons name="add-circle-outline" size={18} color="#fff" />
                      <Text style={styles.emptyBtnText}>İlk Projeni Oluştur</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null)
        }
        ListFooterComponent={
          layoutMode === 'kanban' && activeFilter === 'Aktif'
            ? renderKanbanBoard()
            : null
        }
        contentContainerStyle={[styles.listContent, (layoutMode === 'kanban' && activeFilter === 'Aktif') ? { flexGrow: 1 } : (filteredProjects.length === 0 && { flexGrow: 1 })]}
        renderItem={({ item }) => {
          const tasks = item.tasks || [];
          const completedCount = tasks.filter(t => t.completed === true || t.status === 'done').length;
          const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
          const isArchived = !!item.archived;
          const projectId = item._id || item.id;

          return (
            <TouchableOpacity
              style={[styles.projectCard, { borderLeftColor: item.color || colors.accent }]}
              onPress={() => navigation.navigate('ProjectDetails', {
                projectId,
                projectTitle: item.title,
                projectColor: item.color || colors.accent
              })}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBox}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={[styles.statusBadge, isArchived && { backgroundColor: `${colors.textSecondary}15` }]}>
                    <Text style={[styles.statusText, isArchived && { color: colors.textSecondary }]}>
                      {isArchived ? 'ARŞİVLENDİ' : progress === 100 ? 'TAMAMLANDI' : 'DEVAM EDİYOR'}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => handleArchive(projectId, isArchived)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons
                      name={isArchived ? 'arrow-undo-outline' : 'archive-outline'}
                      size={17}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(projectId)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={17} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Priority & Deadline Tags (Web ile eşdeğer) */}
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {item.priority && (
                  <View style={[styles.tagPill, {
                    borderColor: item.priority === 'Yüksek' ? colors.danger : item.priority === 'Orta' ? colors.warning : colors.success
                  }]}>
                    <Text style={[styles.tagPillText, {
                      color: item.priority === 'Yüksek' ? colors.danger : item.priority === 'Orta' ? colors.warning : colors.success
                    }]}>{item.priority} Öncelik</Text>
                  </View>
                )}
                {item.deadline && (
                  <View style={[styles.tagPill, { borderColor: colors.border }]}>
                    <Text style={[styles.tagPillText, { color: colors.textSecondary }]}>Son: {item.deadline}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.cardInfo}>{completedCount} / {tasks.length} Görev Tamamlandı</Text>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, {
                  width: `${Math.max(progress, progress > 0 ? 2 : 0)}%`,
                  backgroundColor: item.color || colors.accent
                }]} />
              </View>
              <Text style={[styles.progressPercent, { color: progress === 100 ? colors.success : colors.warning }]}>%{progress}</Text>
            </TouchableOpacity>
          );
        }}
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
  headerRight: { flexDirection: 'row', alignItems: 'center' },

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

  searchSection: { paddingHorizontal: 20, marginTop: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 12, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, marginLeft: 10, color: colors.textPrimary, fontSize: 14 },

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

  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: `${colors.bg}50`,
  },
  tagPillText: { fontSize: 10, fontWeight: '600' },

  cardInfo: { color: colors.textSecondary, fontSize: 12, marginBottom: 12 },
  progressBarBg: { height: 4, backgroundColor: `${colors.textSecondary}15`, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  progressPercent: { color: colors.danger, fontSize: 10, fontWeight: '800', alignSelf: 'flex-end', marginTop: 6 },

  // Öncelik filtre hapları
  priorityFilterRow: { paddingHorizontal: 20, paddingBottom: 2, gap: 8 },
  priorityPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  priorityPillActive: { borderWidth: 0 },
  priorityPillText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  priorityPillTextActive: { color: '#fff', fontWeight: '700' },

  // Boş durum
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: `${colors.accent}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

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

  // Layout & Kanban Styles
  layoutToggleContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: 'flex-start',
  },
  layoutBtnGroup: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  layoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  layoutBtnActive: {
    backgroundColor: `${colors.accent}15`,
  },
  layoutBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  kanbanScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  kanbanColumn: {
    width: width * 0.78,
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 450,
    overflow: 'hidden',
  },
  kanbanColHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 3,
  },
  kanbanColTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  kanbanColCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  kanbanColCountText: {
    fontSize: 11,
    fontWeight: '900',
  },
  kanbanColBody: {
    padding: 12,
  },
  kanbanCard: {
    backgroundColor: colors.bg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  kanbanCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  kanbanCardInfo: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 8,
  },
  kanbanProgressBarBg: {
    height: 4,
    backgroundColor: `${colors.textSecondary}15`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  kanbanProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  kanbanProgressPercent: {
    fontSize: 9,
    fontWeight: '900',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  kanbanEmptyCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
  },
  kanbanEmptyColText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
