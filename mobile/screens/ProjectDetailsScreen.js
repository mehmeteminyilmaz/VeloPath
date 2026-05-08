import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchProjectDetails, createTask, deleteTaskAPI, toggleTaskAPI, updateProjectAPI, shareProjectAPI, updateTaskAPI } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import TaskNoteModal from '../components/TaskNoteModal';

export default function ProjectDetailsScreen({ route, navigation }) {
  const { projectId, projectTitle, projectColor } = route.params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskWeek, setNewTaskWeek] = useState('1');
  const [newTaskDependsOn, setNewTaskDependsOn] = useState(null);
  const [newTaskPriority, setNewTaskPriority] = useState('Orta');
  const [adding, setAdding] = useState(false);

  const [notesDraft, setNotesDraft] = useState('');
  const [notesView, setNotesView] = useState('edit');
  const [notesOpen, setNotesOpen] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);

  const insets = useSafeAreaInsets();
  const { colors, themeName } = useTheme();
  const styles = createStyles(colors, insets);

  const loadProject = useCallback(async () => {
    try {
      const data = await fetchProjectDetails(projectId);
      if (data) {
        setProject(data);
        setNotesDraft(data.projectNotes || '');
      }
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
      await createTask(projectId, { 
        title: newTaskTitle.trim(),
        weekIndex: parseInt(newTaskWeek) || 1,
        dependsOn: newTaskDependsOn,
        priority: newTaskPriority
      });
      setNewTaskTitle('');
      setNewTaskDependsOn(null);
      setNewTaskPriority('Orta');
      await loadProject();
    } catch (err) {
      Alert.alert('Hata', 'Görev oluşturulamadı');
    } finally {
      setAdding(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateProjectAPI(projectId, { projectNotes: notesDraft });
      await loadProject();
      Alert.alert('Başarılı', 'Notlar kaydedildi.');
    } catch (err) {
      Alert.alert('Hata', 'Notlar kaydedilemedi');
    } finally {
      setSavingNotes(false);
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

  const handleShare = () => {
    Alert.prompt(
      'Projeyi Paylaş',
      'Kullanıcı adını girin:',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Paylaş', onPress: async (username) => {
            if (!username.trim()) return;
            try {
              await shareProjectAPI(projectId, username.trim());
              Alert.alert('Başarılı', `${username} projeye eklendi!`);
            } catch (err) {
              Alert.alert('Hata', 'Paylaşılamadı.');
            }
          } 
        }
      ],
      'plain-text'
    );
  };

  const handleArchive = () => {
    const isArchived = project?.archived;
    Alert.alert(
      isArchived ? 'Arşivden Çıkar' : 'Arşivle',
      isArchived ? 'Projeyi arşivden çıkarmak istiyor musun?' : 'Projeyi arşivlemek istiyor musun?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Evet', onPress: async () => {
            try {
              await updateProjectAPI(projectId, { archived: !isArchived });
              navigation.goBack();
            } catch (err) {
              Alert.alert('Hata', 'İşlem başarısız');
            }
          }
        }
      ]
    );
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
  };

  const handleSaveTaskDetails = async (taskId, updates) => {
    try {
      await updateTaskAPI(taskId, updates);
      await loadProject();
    } catch (err) {
      Alert.alert('Hata', 'Görev güncellenemedi');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={projectColor || colors.accent} />
      </View>
    );
  }

  const tasks = project?.tasks || [];
  const isTaskDone = (t) => t.completed === true || t.status === 'done';
  const completedCount = tasks.filter(isTaskDone).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Haftalara göre grupla
  const groupedTasks = React.useMemo(() => {
    if (!tasks) return [];
    const grouped = {};
    tasks.forEach(t => {
      const w = t.week || 1;
      if (!grouped[w]) grouped[w] = [];
      grouped[w].push(t);
    });
    const weeks = Object.keys(grouped).sort((a,b) => parseInt(a) - parseInt(b));
    let result = [];
    weeks.forEach(w => {
      result.push({ isHeader: true, week: w, id: `header-${w}` });
      grouped[w].forEach(t => result.push({ ...t, isHeader: false }));
    });
    return result;
  }, [tasks]);

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
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color={projectColor || colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleArchive}>
            <Ionicons name={project?.archived ? "archive" : "archive-outline"} size={24} color={project?.archived ? colors.accent : colors.textSecondary} />
          </TouchableOpacity>
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
        data={groupedTasks}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        renderItem={({ item }) => {
          if (item.isHeader) {
            return (
              <View style={styles.weekHeader}>
                <Ionicons name="calendar-outline" size={18} color={projectColor || colors.accent} />
                <Text style={[styles.weekHeaderText, { color: projectColor || colors.accent }]}>Hafta {item.week}</Text>
              </View>
            );
          }

          const done = isTaskDone(item);
          return (
            <TouchableOpacity 
              style={[styles.taskCard, done && styles.taskCardCompleted]}
              onPress={() => handleTaskPress(item)}
              activeOpacity={0.7}
            >
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
                  {item.title || item.text}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDeleteTask(item._id || item.id)}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Henüz görev eklenmemiş</Text>
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingTop: 20 }}>
            {/* Yeni Görev Planla Kartı */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Yeni Görev Planla</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Görev adı..."
                placeholderTextColor={colors.textSecondary}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />

              <View style={styles.row}>
                <View style={styles.inputHalf}>
                  <Text style={styles.label}>Hafta</Text>
                  <TextInput
                    style={[styles.input, { height: 44, marginTop: 4 }]}
                    keyboardType="number-pad"
                    value={newTaskWeek}
                    onChangeText={setNewTaskWeek}
                  />
                </View>

                <View style={styles.inputHalf}>
                  <Text style={styles.label}>Öncelik</Text>
                  <View style={{flexDirection: 'row', gap: 5, marginTop: 4}}>
                    {['Düşük', 'Orta', 'Yüksek'].map(p => (
                      <TouchableOpacity 
                        key={p} 
                        style={[styles.pill, newTaskPriority === p && { backgroundColor: projectColor || colors.accent }]}
                        onPress={() => setNewTaskPriority(p)}
                      >
                        <Text style={[styles.pillText, newTaskPriority === p && { color: '#fff' }]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: projectColor || colors.accent, marginTop: 15 }]} 
                onPress={handleAddTask}
                disabled={adding}
              >
                {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>+ Ekle</Text>}
              </TouchableOpacity>
            </View>

            {/* Proje Notları Kartı */}
            <View style={[styles.card, { marginTop: 20 }]}>
               <TouchableOpacity style={styles.notesHeader} onPress={() => setNotesOpen(!notesOpen)}>
                 <View style={{flexDirection:'row', alignItems:'center'}}>
                   <Ionicons name="document-text-outline" size={20} color={projectColor || colors.accent} style={{marginRight:8}}/>
                   <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Proje Notları</Text>
                 </View>
                 <Ionicons name={notesOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
               </TouchableOpacity>

               {notesOpen && (
                 <View style={styles.notesBody}>
                   <View style={styles.tabsRow}>
                     <TouchableOpacity style={[styles.tabBtn, notesView === 'edit' && { borderBottomColor: projectColor || colors.accent, borderBottomWidth: 2 }]} onPress={() => setNotesView('edit')}>
                       <Text style={[styles.tabBtnText, notesView === 'edit' && { color: projectColor || colors.accent }]}>Düzenle</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={[styles.tabBtn, notesView === 'preview' && { borderBottomColor: projectColor || colors.accent, borderBottomWidth: 2 }]} onPress={() => setNotesView('preview')}>
                       <Text style={[styles.tabBtnText, notesView === 'preview' && { color: projectColor || colors.accent }]}>Önizleme</Text>
                     </TouchableOpacity>
                   </View>

                   {notesView === 'edit' ? (
                     <TextInput
                       style={styles.notesInput}
                       multiline
                       placeholder="Proje hakkında notlar, toplantı kararları..."
                       placeholderTextColor={colors.textSecondary}
                       value={notesDraft}
                       onChangeText={setNotesDraft}
                     />
                   ) : (
                     <View style={styles.notesPreview}>
                       <Text style={{color: colors.textPrimary}}>{notesDraft || 'Henüz not girilmedi.'}</Text>
                     </View>
                   )}

                   <TouchableOpacity 
                     style={[styles.primaryBtn, { backgroundColor: projectColor || colors.accent, marginTop: 15 }]} 
                     onPress={handleSaveNotes}
                     disabled={savingNotes}
                   >
                     {savingNotes ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Notları Kaydet</Text>}
                   </TouchableOpacity>
                 </View>
               )}
            </View>
          </View>
        }
      />
      <TaskNoteModal
        visible={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTaskDetails}
      />
    </View>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centerContainer: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  weekHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

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

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesBody: {
    marginTop: 15,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 10,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    padding: 12,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  notesPreview: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    padding: 12,
  },
});
