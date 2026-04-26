import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAllData, createTask, updateTaskAPI, deleteTaskAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme/colors';

const PRIORITY_LABELS = { high: '🔴 Yüksek', medium: '🟡 Orta', low: '🟢 Düşük' };
const STATUS_LABELS = { todo: 'Yapılacak', 'in-progress': 'Devam Ediyor', done: 'Tamamlandı' };

export default function ProjectDetailsScreen({ route, navigation }) {
  const { projectId, projectTitle, projectColor } = route.params;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [syncPulse, setSyncPulse] = useState(false);

  // Modal states
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [adding, setAdding] = useState(false);

  const loadTasks = useCallback(async (uid) => {
    try {
      const data = await fetchAllData(uid);
      const project = data?.find(p => (p._id || p.id) === projectId);
      if (project) {
        setTasks(project.tasks || []);
        setSyncPulse(true);
        setTimeout(() => setSyncPulse(false), 800);
      }
    } catch (err) {
      console.error('Görevler yüklenemedi:', err);
    }
  }, [projectId]);

  useEffect(() => {
    const init = async () => {
      const uid = await AsyncStorage.getItem('userId');
      setUserId(uid);
      if (uid) {
        await loadTasks(uid);
        connectSocket(uid, () => loadTasks(uid));
      }
      setLoading(false);
    };
    init();

    return () => disconnectSocket();
  }, [loadTasks]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Hata', 'Görev adı boş bırakılamaz');
      return;
    }
    setAdding(true);
    try {
      await createTask({
        projectId,
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        status: 'todo',
      });
      setShowAddTask(false);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      // Socket tetiklenecek → otomatik yenile
    } catch (err) {
      Alert.alert('Hata', 'Görev eklenemedi');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleTask = async (task) => {
    const newStatus = task.completed ? 'todo' : 'done';
    try {
      await updateTaskAPI(task._id || task.id, { status: newStatus });
      // Socket otomatik tetiklenecek
    } catch (err) {
      Alert.alert('Hata', 'Görev güncellenemedi');
    }
  };

  const handleDeleteTask = (task) => {
    Alert.alert(
      'Görevi Sil',
      `"${task.text || task.title}" silinsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTaskAPI(task._id || task.id);
            } catch (err) {
              Alert.alert('Hata', 'Görev silinemedi');
            }
          },
        },
      ]
    );
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const renderTask = ({ item }) => (
    <View style={[styles.taskCard, item.completed && styles.taskCardDone]}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && { backgroundColor: COLORS.success, borderColor: COLORS.success }]}
        onPress={() => handleToggleTask(item)}
        activeOpacity={0.8}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]} numberOfLines={2}>
          {item.text || item.title}
        </Text>
        <View style={styles.taskMeta}>
          <Text style={styles.priorityText}>{PRIORITY_LABELS[item.priority] || '🟡 Orta'}</Text>
          <Text style={[styles.statusBadge, { color: item.completed ? COLORS.success : COLORS.accent }]}>
            {STATUS_LABELS[item.status] || 'Yapılacak'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleDeleteTask(item)}
        style={styles.deleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.deleteBtnText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: projectColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{projectTitle}</Text>
          <Text style={styles.headerProgress}>{completedCount}/{tasks.length} tamamlandı</Text>
        </View>
        <View style={[styles.syncIndicator, syncPulse && styles.syncPulseOn]}>
          <Text style={styles.syncDot}>●</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: projectColor }]} />
        </View>
        <Text style={[styles.progressPct, { color: projectColor }]}>{progress}%</Text>
      </View>

      {/* Görev listesi */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyTitle}>Görev yok</Text>
            <Text style={styles.emptyDesc}>
              + butonuna tıklayarak görev ekle
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: projectColor }]}
        onPress={() => setShowAddTask(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Görev Ekle Modal */}
      <Modal
        visible={showAddTask}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddTask(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddTask(false)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Yeni Görev</Text>

          <Text style={styles.label}>Görev Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="Görev adını girin..."
            placeholderTextColor={COLORS.textMuted}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            autoFocus
          />

          <Text style={styles.label}>Öncelik</Text>
          <View style={styles.priorityRow}>
            {['low', 'medium', 'high'].map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBtn,
                  newTaskPriority === p && styles.priorityBtnActive,
                  newTaskPriority === p && {
                    borderColor: p === 'high' ? COLORS.danger : p === 'medium' ? COLORS.warning : COLORS.success,
                    backgroundColor: p === 'high' ? 'rgba(239,68,68,0.15)' : p === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                  }
                ]}
                onPress={() => setNewTaskPriority(p)}
              >
                <Text style={styles.priorityBtnText}>{PRIORITY_LABELS[p]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: projectColor }, adding && { opacity: 0.6 }]}
            onPress={handleAddTask}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Görev Ekle</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 2,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 22, color: COLORS.textPrimary },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary },
  headerProgress: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  syncIndicator: { opacity: 0.4 },
  syncPulseOn: { opacity: 1 },
  syncDot: { color: COLORS.success, fontSize: 14 },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressPct: { fontSize: FONTS.sizes.sm, fontWeight: '700', minWidth: 36 },

  listContent: { padding: 16, gap: 10, paddingBottom: 100 },

  taskCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskCardDone: { opacity: 0.65 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  taskContent: { flex: 1, gap: 6 },
  taskTitle: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary, lineHeight: 20 },
  taskTitleDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  taskMeta: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  priorityText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  statusBadge: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  deleteBtn: { padding: 2 },
  deleteBtnText: { fontSize: 16 },

  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary },
  emptyDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },

  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.card,
  },
  fabText: { fontSize: 32, color: '#fff', lineHeight: 36 },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
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
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 20 },
  label: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6 },
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
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  priorityBtnActive: {},
  priorityBtnText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },
  addButton: { borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: '700' },
});
