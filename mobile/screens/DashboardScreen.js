import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert, RefreshControl, Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAllData, createProject, deleteProjectAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme/colors';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
];

export default function DashboardScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [syncPulse, setSyncPulse] = useState(false);

  const loadData = useCallback(async (uid) => {
    try {
      const data = await fetchAllData(uid);
      if (data) {
        setProjects(data.filter(p => !p.archived));
        // Sync animasyonu
        setSyncPulse(true);
        setTimeout(() => setSyncPulse(false), 1000);
      }
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const uid = await AsyncStorage.getItem('userId');
      const uname = await AsyncStorage.getItem('username');
      setUserId(uid);
      setUsername(uname || '');

      if (uid) {
        await loadData(uid);
        // Socket bağlantısı kur
        connectSocket(uid, () => loadData(uid));
      }
      setLoading(false);
    };
    init();

    return () => disconnectSocket();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(userId);
    setRefreshing(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      Alert.alert('Hata', 'Proje adı boş bırakılamaz');
      return;
    }
    setCreating(true);
    try {
      await createProject({
        title: newProjectTitle.trim(),
        description: newProjectDesc.trim(),
        color: selectedColor,
        user: userId,
      });
      setShowCreateModal(false);
      setNewProjectTitle('');
      setNewProjectDesc('');
      setSelectedColor(PROJECT_COLORS[0]);
      // Socket tetiklenecek ve otomatik yenilenecek
    } catch (err) {
      Alert.alert('Hata', 'Proje oluşturulamadı');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    disconnectSocket();
    navigation.replace('Login');
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return COLORS.success;
    if (progress >= 40) return COLORS.warning;
    return COLORS.accent;
  };

  const renderProject = ({ item }) => {
    const completedTasks = (item.tasks || []).filter(t => t.completed).length;
    const totalTasks = (item.tasks || []).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
      <TouchableOpacity
        style={[styles.projectCard, { borderLeftColor: item.color || COLORS.accent }]}
        onPress={() => navigation.navigate('ProjectDetails', {
          projectId: item._id || item.id,
          projectTitle: item.title,
          projectColor: item.color || COLORS.accent,
        })}
        activeOpacity={0.85}
      >
        <View style={styles.projectHeader}>
          <View style={[styles.colorDot, { backgroundColor: item.color || COLORS.accent }]} />
          <Text style={styles.projectTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.taskBadge}>
            <Text style={styles.taskBadgeText}>{totalTasks} görev</Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.projectDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: getProgressColor(progress),
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: getProgressColor(progress) }]}>
            {progress}%
          </Text>
        </View>

        <Text style={styles.completedText}>
          {completedTasks}/{totalTasks} tamamlandı
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Projelerim</Text>
          <Text style={styles.headerSub}>Merhaba, {username} 👋</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.syncIndicator, syncPulse && styles.syncIndicatorPulse]}>
            <Text style={styles.syncDot}>●</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Proje listesi */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderProject}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📁</Text>
            <Text style={styles.emptyTitle}>Henüz proje yok</Text>
            <Text style={styles.emptyDesc}>
              İlk projeyi oluştur ve web ile senkronize çalışmaya başla
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Proje Oluştur Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCreateModal(false)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Yeni Proje</Text>

          <Text style={styles.label}>Proje Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="Proje adını girin..."
            placeholderTextColor={COLORS.textMuted}
            value={newProjectTitle}
            onChangeText={setNewProjectTitle}
          />

          <Text style={styles.label}>Açıklama (opsiyonel)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Proje açıklaması..."
            placeholderTextColor={COLORS.textMuted}
            value={newProjectDesc}
            onChangeText={setNewProjectDesc}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Renk</Text>
          <View style={styles.colorPicker}>
            {PROJECT_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.createButton, creating && { opacity: 0.6 }]}
            onPress={handleCreateProject}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Proje Oluştur</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  syncIndicator: { opacity: 0.5 },
  syncIndicatorPulse: { opacity: 1 },
  syncDot: { color: COLORS.success, fontSize: 14 },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
  },
  logoutText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },

  listContent: { padding: 16, gap: 12, paddingBottom: 100 },

  projectCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderLeftWidth: 3,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: COLORS.border,
    borderRightColor: COLORS.border,
    borderBottomColor: COLORS.border,
    ...SHADOW.card,
  },
  projectHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  projectTitle: {
    flex: 1,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  taskBadge: {
    backgroundColor: COLORS.accentGlow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  taskBadgeText: { fontSize: FONTS.sizes.xs, color: COLORS.accentLight, fontWeight: '600' },
  projectDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: FONTS.sizes.xs, fontWeight: '700', minWidth: 32 },
  completedText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },

  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary },
  emptyDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.card,
  },
  fabText: { fontSize: 32, color: '#fff', lineHeight: 36 },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalHandle: {
    width: 40, height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
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
    marginBottom: 16,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  colorPicker: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  colorOption: { width: 36, height: 36, borderRadius: 18 },
  colorOptionSelected: { borderWidth: 3, borderColor: '#fff' },
  createButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createButtonText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: '700' },
});
