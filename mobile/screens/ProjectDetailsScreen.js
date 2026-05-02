import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchProjectDetails, createTask, deleteTaskAPI, toggleTaskAPI } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function ProjectDetailsScreen({ route, navigation }) {
  const { projectId, projectTitle, projectColor } = route.params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const insets = useSafeAreaInsets();
  const { colors, themeName } = useTheme();
  const styles = createStyles(colors, insets);

  const loadProject = useCallback(async () => {
    try {
      const data = await fetchProjectDetails(projectId);
      if (data) setProject(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Bilinmeyen hata';
      Alert.alert('Bağlantı Hatası', `Proje detayları çekilemedi: ${msg}`);
      console.error('API Hatası:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProject();
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setAdding(true);
    try {
      await createTask(projectId, { title: newTaskTitle.trim() });
      setNewTaskTitle('');
      await loadProject();
    } catch (err) {
      Alert.alert('Hata', 'Görev oluşturulamadı');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await toggleTaskAPI(taskId);
      await loadProject();
    } catch (err) {
      Alert.alert('Hata', 'Durum güncellenemedi');
    }
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert('Görevi Sil', 'Bu görevi silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTaskAPI(taskId);
            await loadProject();
          } catch (err) {
            Alert.alert('Hata', 'Görev silinemedi');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={projectColor || colors.accent} />
      </View>
    );
  }

  const tasks = project?.tasks || [];
  // Backend'den hem completed (boolean) hem status ('done') gelebilir
  const isTaskDone = (t) => t.completed === true || t.status === 'done';
  const completedCount = tasks.filter(isTaskDone).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, {
        borderBottomColor: projectColor || colors.accent,
        paddingTop: insets.top + 10
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{projectTitle}</Text>
          <Text style={styles.headerSub}>{tasks.length} Görev • %{progress} Tamamlandı</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, {
            width: `${Math.max(progress, progress > 0 ? 2 : 0)}%`,
            backgroundColor: projectColor || colors.accent
          }]} />
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        renderItem={({ item }) => {
          const done = isTaskDone(item);
          return (
            <View style={[styles.taskCard, done && styles.taskCardCompleted]}>
              <TouchableOpacity
                style={styles.checkArea}
                onPress={() => handleToggleTask(item._id || item.id)}
              >
                <View style={[
                  styles.checkbox,
                  done && { backgroundColor: projectColor || colors.accent, borderColor: projectColor || colors.accent }
                ]}>
                  {done && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={[styles.taskTitle, done && styles.taskTitleCompleted]} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDeleteTask(item._id || item.id)}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Henüz görev eklenmemiş</Text>
          </View>
        }
      />

      {/* Add Task Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TextInput
            style={styles.input}
            placeholder="Yeni görev ekle..."
            placeholderTextColor={colors.textSecondary}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: projectColor || colors.accent }]}
            onPress={handleAddTask}
            disabled={adding}
          >
            {adding
              ? <ActivityIndicator color="#fff" size="small" />
              : <Ionicons name="add" size={28} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centerContainer: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 2,
    backgroundColor: colors.bgCard,
  },
  backBtn: { padding: 8, marginLeft: -10, marginRight: 10 },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  progressSection: { paddingHorizontal: 20, paddingTop: 15 },
  progressBarBg: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },

  listContent: { padding: 20, paddingBottom: 120 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardCompleted: { opacity: 0.6 },
  checkArea: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 24, height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  taskTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '500', flex: 1 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: colors.textSecondary },

  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    width: 52, height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: colors.textSecondary, fontSize: 15, fontWeight: '500' },
});
