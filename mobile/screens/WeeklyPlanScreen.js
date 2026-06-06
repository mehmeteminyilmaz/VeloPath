import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, RefreshControl, ScrollView, Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllData, toggleTaskAPI, deleteTaskAPI, updateTaskAPI } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import TaskNoteModal from '../components/TaskNoteModal';

const PRIORITY_COLOR = {
  Yüksek: '#ef4444', high: '#ef4444',
  Orta: '#f59e0b', medium: '#f59e0b',
  Düşük: '#10b981', low: '#10b981',
};
const PRIORITY_LABEL = {
  Yüksek: '🔴', high: '🔴',
  Orta: '🟡', medium: '🟡',
  Düşük: '🟢', low: '🟢',
};

function getDueLabel(dueDate, colors) {
  const due = new Date(dueDate);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due); dueDay.setHours(0, 0, 0, 0);
  const diff = Math.round((dueDay - today) / 86400000);
  const isOverdue = diff < 0;
  const isToday = diff === 0;
  const color = isOverdue ? colors.danger : isToday ? '#f59e0b' : colors.textSecondary;
  const label = isOverdue
    ? `${Math.abs(diff)}g geçti`
    : isToday ? 'Bugün'
    : diff === 1 ? 'Yarın'
    : due.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  return { color, label, isOverdue, isToday };
}

function WeekSection({ week, tasks, colors, projectMap, onToggle, onDelete, onNoteOpen, styles }) {
  const [expanded, setExpanded] = useState(true);
  const done = tasks.filter(t => t.completed || t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  const progressColor =
    progress === 100 ? colors.success
    : progress > 70 ? '#8b5cf6'
    : progress > 30 ? colors.accent
    : colors.warning;

  return (
    <View style={[styles.weekCard, { borderLeftColor: progressColor }]}>
      {/* Hafta başlığı */}
      <TouchableOpacity style={styles.weekHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
        <View style={styles.weekHeaderLeft}>
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={18}
            color={colors.textSecondary}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.weekTitle, { color: progressColor }]}>Hafta {week}</Text>
            <Text style={styles.weekSub}>{done}/{tasks.length} Görev</Text>
          </View>
        </View>
        <View style={styles.weekHeaderRight}>
          {/* Dairesel progress */}
          <View style={styles.circleWrap}>
            <Text style={[styles.circleText, { color: progressColor }]}>%{progress}</Text>
          </View>
          {progress === 100 && <Ionicons name="trophy" size={18} color={colors.success} style={{ marginLeft: 6 }} />}
        </View>
      </TouchableOpacity>

      {/* İlerleme çubuğu */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: progressColor }]} />
      </View>

      {/* Görevler */}
      {expanded && tasks.map(task => {
        const isDone = task.completed || task.status === 'done';
        const pColor = PRIORITY_COLOR[task.priority] || colors.textSecondary;
        const pLabel = PRIORITY_LABEL[task.priority] || '';
        const projectName = projectMap[task.projectId] || '';
        const taskId = task._id || task.id;

        return (
          <View key={taskId} style={[styles.taskItem, isDone && { opacity: 0.55 }]}>
            <TouchableOpacity style={{ marginRight: 12 }} onPress={() => onToggle(taskId)}>
              <View style={[
                styles.checkbox,
                isDone && { backgroundColor: progressColor, borderColor: progressColor }
              ]}>
                {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={[styles.taskText, isDone && styles.taskTextDone]} numberOfLines={2}>
                {task.title || task.text}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {projectName && (
                  <View style={[styles.projBadge, { backgroundColor: `${colors.accent}15` }]}>
                    <Text style={[styles.projBadgeText, { color: colors.accent }]}>{projectName}</Text>
                  </View>
                )}
                {task.priority && (
                  <Text style={{ fontSize: 11, color: pColor, fontWeight: '700' }}>
                    {pLabel} {task.priority === 'high' ? 'Yüksek' : task.priority === 'low' ? 'Düşük' : task.priority === 'medium' ? 'Orta' : task.priority}
                  </Text>
                )}
                {task.dueDate && !isDone && (() => {
                  const { color, label } = getDueLabel(task.dueDate, colors);
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="calendar-outline" size={11} color={color} />
                      <Text style={{ fontSize: 11, color, fontWeight: '600' }}>{label}</Text>
                    </View>
                  );
                })()}
                {task.notes && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Ionicons name="document-text-outline" size={11} color={colors.accent} />
                    <Text style={{ fontSize: 11, color: colors.accent }}>Not</Text>
                  </View>
                )}
                {task.subtasks && task.subtasks.length > 0 && (() => {
                  const d = task.subtasks.filter(s => s.completed).length;
                  return (
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>{d}/{task.subtasks.length} alt görev</Text>
                  );
                })()}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.actionBtn, task.notes && { backgroundColor: `${colors.accent}18` }]}
                onPress={() => onNoteOpen(task)}
              >
                <Ionicons name="document-text-outline" size={17} color={task.notes ? colors.accent : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onDelete(taskId)}
              >
                <Ionicons name="trash-outline" size={17} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Hafta özeti */}
      {expanded && tasks.length > 0 && (
        <View style={[styles.weekSummary, { backgroundColor: progress === 100 ? `${colors.success}12` : `${colors.accent}08` }]}>
          <Ionicons name={progress === 100 ? 'trophy-outline' : 'trending-up-outline'} size={16} color={progress === 100 ? colors.success : colors.accent} />
          <Text style={{ fontSize: 13, color: progress === 100 ? colors.success : colors.accent, marginLeft: 8, fontWeight: '600' }}>
            {progress === 100 ? 'Harika bir hafta! 🎉' : progress > 50 ? 'Güçlü ilerleme! 💪' : 'Yolun başındasın! 🚀'}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function WeeklyPlanScreen({ navigation }) {
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterProject, setFilterProject] = useState('all');

  const { colors, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets);

  const loadData = useCallback(async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;
      const data = await fetchAllData(uid);
      if (data) setAllProjects(data.filter(p => !p.archived));
    } catch (err) {
      console.error('Haftalık plan yükleme hatası:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleToggle = async (taskId) => {
    try {
      await toggleTaskAPI(taskId);
      await loadData();
    } catch (_) {}
  };

  const handleDelete = (taskId) => {
    const { Alert } = require('react-native');
    Alert.alert('Görevi Sil', 'Bu görevi silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => { await deleteTaskAPI(taskId); loadData(); } }
    ]);
  };

  const handleSaveTask = async (taskId, updates) => {
    try {
      await updateTaskAPI(taskId, updates);
      await loadData();
    } catch (_) {}
  };

  // Tüm görevleri birleştir ve haftalara göre grupla
  const projectMap = {};
  allProjects.forEach(p => { projectMap[p._id || p.id] = p.title; });

  const filteredProjects = filterProject === 'all'
    ? allProjects
    : allProjects.filter(p => (p._id || p.id) === filterProject);

  const allTasks = filteredProjects.flatMap(p =>
    (p.tasks || []).map(t => ({ ...t, projectId: p._id || p.id }))
  );

  // Haftaları groupla
  const weekGroups = {};
  allTasks.forEach(t => {
    const w = t.week || t.weekIndex || 1;
    if (!weekGroups[w]) weekGroups[w] = [];
    weekGroups[w].push(t);
  });
  const weeks = Object.keys(weekGroups).sort((a, b) => parseInt(a) - parseInt(b));

  // Genel istatistikler
  const totalDone = allTasks.filter(t => t.completed || t.status === 'done').length;
  const totalPending = allTasks.length - totalDone;
  const globalProgress = allTasks.length > 0 ? Math.round((totalDone / allTasks.length) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Haftalık Plan</Text>
          <Text style={styles.headerSub}>{allTasks.length} görev • %{globalProgress} tamamlandı</Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Özet bar */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success }]}>{totalDone}</Text>
          <Text style={styles.statLabel}>Tamamlanan</Text>
        </View>
        <View style={[styles.statDivider]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{totalPending}</Text>
          <Text style={styles.statLabel}>Bekleyen</Text>
        </View>
        <View style={[styles.statDivider]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.accent }]}>{weeks.length}</Text>
          <Text style={styles.statLabel}>Hafta</Text>
        </View>
        <View style={[styles.statDivider]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: globalProgress === 100 ? colors.success : colors.accent }]}>%{globalProgress}</Text>
          <Text style={styles.statLabel}>Genel</Text>
        </View>
      </View>

      {/* Proje filtresi */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 52 }}
        contentContainerStyle={styles.projectFilterRow}
      >
        <TouchableOpacity
          style={[styles.projFilter, filterProject === 'all' && { backgroundColor: colors.accent, borderColor: colors.accent }]}
          onPress={() => setFilterProject('all')}
        >
          <Text style={[styles.projFilterText, filterProject === 'all' && { color: '#fff' }]}>Tümü</Text>
        </TouchableOpacity>
        {allProjects.map(p => {
          const pid = p._id || p.id;
          const isActive = filterProject === pid;
          return (
            <TouchableOpacity
              key={pid}
              style={[styles.projFilter, isActive && { backgroundColor: p.color || colors.accent, borderColor: p.color || colors.accent }]}
              onPress={() => setFilterProject(pid)}
            >
              <Text style={[styles.projFilterText, isActive && { color: '#fff' }]} numberOfLines={1}>{p.title}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Hafta listesi */}
      <FlatList
        data={weeks}
        keyExtractor={w => `week-${w}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={52} color={colors.border} />
            <Text style={styles.emptyTitle}>Henüz Görev Planlanmadı</Text>
            <Text style={styles.emptyDesc}>Projelere görev ekleyerek haftalık planınızı oluşturun.</Text>
          </View>
        }
        renderItem={({ item: week }) => (
          <WeekSection
            week={week}
            tasks={weekGroups[week] || []}
            colors={colors}
            projectMap={projectMap}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onNoteOpen={setSelectedTask}
            styles={styles}
          />
        )}
      />

      <TaskNoteModal
        visible={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTask}
      />
    </View>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: insets.top + 10,
    paddingBottom: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 8, marginLeft: -8, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },

  projectFilterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  projFilter: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    marginRight: 8,
  },
  projFilterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },

  listContent: { padding: 16, paddingBottom: 100 },

  weekCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  weekHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  weekHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  weekTitle: { fontSize: 16, fontWeight: '800' },
  weekSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontWeight: '500' },
  circleWrap: { alignItems: 'center' },
  circleText: { fontSize: 14, fontWeight: '800' },

  progressBarBg: { height: 3, backgroundColor: colors.border, marginHorizontal: 16, marginBottom: 12, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkbox: {
    width: 22, height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  taskText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  taskTextDone: { textDecorationLine: 'line-through', color: colors.textSecondary },
  projBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  projBadgeText: { fontSize: 10, fontWeight: '700' },

  actionBtn: {
    width: 32, height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${colors.textSecondary}12`,
  },

  weekSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
  },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  emptyDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
});
