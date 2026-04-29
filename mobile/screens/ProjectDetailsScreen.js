import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchProjectDetails, createTask, deleteTaskAPI, toggleTaskAPI } from '../services/api';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

export default function ProjectDetailsScreen({ route, navigation }) {
  const { projectId, projectTitle, projectColor } = route.params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [adding, setAdding] = useState(false);

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
        <ActivityIndicator size="large" color={projectColor || COLORS.accent} />
      </View>
    );
  }

  const tasks = project?.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Area */}
      <View style={[styles.header, { borderBottomColor: projectColor || COLORS.accent }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
           <Text style={styles.headerTitle} numberOfLines={1}>{projectTitle}</Text>
           <Text style={styles.headerSub}>{tasks.length} Görev • %{progress} Tamamlandı</Text>
        </View>
      </View>

      {/* Progress Bar - Web Style */}
      <View style={styles.progressSection}>
         <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: projectColor || COLORS.accent }]} />
         </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
            <TouchableOpacity 
              style={styles.checkArea} 
              onPress={() => handleToggleTask(item._id || item.id)}
            >
              <View style={[
                styles.checkbox, 
                item.completed && { backgroundColor: projectColor || COLORS.accent, borderColor: projectColor || COLORS.accent }
              ]}>
                {item.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
                {item.title}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleDeleteTask(item._id || item.id)}>
              <Ionicons name="trash-outline" size={20} color="#f87171" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={48} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>Henüz görev eklenmemiş</Text>
          </View>
        }
      />

      {/* Add Task Input - Web Style */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Yeni görev ekle..."
            placeholderTextColor="#666"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: projectColor || COLORS.accent }]}
            onPress={handleAddTask}
            disabled={adding}
          >
            {adding ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="add" size={28} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    borderBottomWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  backBtn: { padding: 8, marginLeft: -10, marginRight: 10 },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#666', marginTop: 2 },

  progressSection: { paddingHorizontal: 20, paddingTop: 15 },
  progressBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },

  listContent: { padding: 20, paddingBottom: 100 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  taskCardCompleted: { opacity: 0.6 },
  checkArea: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 24, height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: { color: '#fff', fontSize: 16, fontWeight: '500' },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: '#666' },

  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25, // Alt kısımdaki iç içe girmişliği çözen boşluk
    backgroundColor: '#111827', // Web Midnight tonu
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  addBtn: {
    width: 52, height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#4b5563', fontSize: 15, fontWeight: '500' },
});
