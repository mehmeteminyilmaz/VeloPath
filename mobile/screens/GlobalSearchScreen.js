import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAllData } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

// Tüm projelerin görevleri dahil düz sonuçlar üretir
function buildSearchIndex(projects) {
  const results = [];
  projects.forEach(project => {
    // Proje kendisi
    results.push({
      type: 'project',
      id: project._id || project.id,
      projectId: project._id || project.id,
      projectTitle: project.title,
      projectColor: project.color || '#6366f1',
      title: project.title,
      description: project.description || '',
      priority: project.priority,
      deadline: project.deadline,
      archived: project.archived,
    });
    // Görevler
    (project.tasks || []).forEach(task => {
      results.push({
        type: 'task',
        id: task._id || task.id,
        projectId: project._id || project.id,
        projectTitle: project.title,
        projectColor: project.color || '#6366f1',
        title: task.title || task.text || '',
        notes: task.notes || '',
        priority: task.priority,
        dueDate: task.dueDate,
        completed: task.completed || task.status === 'done',
        tags: task.tags || [],
      });
    });
  });
  return results;
}

function highlight(text, query) {
  if (!query.trim() || !text) return [{ text, bold: false }];
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return [{ text, bold: false }];
  return [
    { text: text.slice(0, idx), bold: false },
    { text: text.slice(idx, idx + query.length), bold: true },
    { text: text.slice(idx + query.length), bold: false },
  ];
}

function HighlightText({ text, query, style, boldStyle }) {
  const parts = highlight(text, query);
  return (
    <Text style={style}>
      {parts.map((p, i) =>
        p.bold
          ? <Text key={i} style={boldStyle}>{p.text}</Text>
          : <Text key={i}>{p.text}</Text>
      )}
    </Text>
  );
}

const PRIORITY_COLOR = {
  Yüksek: '#ef4444', high: '#ef4444',
  Orta: '#f59e0b', medium: '#f59e0b',
  Düşük: '#10b981', low: '#10b981',
};

export default function GlobalSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'project' | 'task'

  const { colors, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets);

  useEffect(() => {
    const loadIndex = async () => {
      try {
        const uid = await AsyncStorage.getItem('userId');
        if (!uid) return;
        const data = await fetchAllData(uid);
        if (data) setSearchIndex(buildSearchIndex(data));
      } catch (err) {
        console.error('Arama indeksi yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    loadIndex();
  }, []);

  const results = searchIndex.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.notes?.toLowerCase().includes(q) ||
      item.projectTitle?.toLowerCase().includes(q) ||
      (item.tags || []).some(t => t.toLowerCase().includes(q))
    );
  });

  const handlePress = (item) => {
    if (item.type === 'project') {
      navigation.navigate('ProjectDetails', {
        projectId: item.projectId,
        projectTitle: item.projectTitle,
        projectColor: item.projectColor,
      });
    } else {
      navigation.navigate('ProjectDetails', {
        projectId: item.projectId,
        projectTitle: item.projectTitle,
        projectColor: item.projectColor,
      });
    }
  };

  const renderItem = ({ item }) => {
    const pColor = PRIORITY_COLOR[item.priority] || colors.textSecondary;
    const isTask = item.type === 'task';

    return (
      <TouchableOpacity style={styles.resultCard} onPress={() => handlePress(item)} activeOpacity={0.75}>
        {/* Sol renk şeridi */}
        <View style={[styles.stripe, { backgroundColor: item.projectColor }]} />

        <View style={{ flex: 1 }}>
          {/* Tip badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <View style={[styles.typeBadge, { backgroundColor: isTask ? `${colors.accent}15` : `${colors.success}15` }]}>
              <Ionicons
                name={isTask ? 'checkbox-outline' : 'briefcase-outline'}
                size={11}
                color={isTask ? colors.accent : colors.success}
              />
              <Text style={[styles.typeText, { color: isTask ? colors.accent : colors.success }]}>
                {isTask ? 'Görev' : 'Proje'}
              </Text>
            </View>
            {isTask && (
              <Text style={styles.projectRef} numberOfLines={1}>
                {item.projectTitle}
              </Text>
            )}
          </View>

          {/* Başlık — highlight */}
          <HighlightText
            text={item.title}
            query={query}
            style={[styles.resultTitle, item.completed && { textDecorationLine: 'line-through', opacity: 0.6 }]}
            boldStyle={{ backgroundColor: `${colors.accent}30`, color: colors.accent, borderRadius: 3 }}
          />

          {/* Açıklama / Not — highlight */}
          {(item.description || item.notes) && (
            <HighlightText
              text={(item.description || item.notes).slice(0, 80)}
              query={query}
              style={styles.resultDesc}
              boldStyle={{ color: colors.accent, fontWeight: '700' }}
            />
          )}

          {/* Alt bilgiler */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {item.priority && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: pColor }} />
                <Text style={{ fontSize: 10, color: pColor, fontWeight: '700' }}>
                  {item.priority === 'high' ? 'Yüksek' : item.priority === 'low' ? 'Düşük' : item.priority === 'medium' ? 'Orta' : item.priority}
                </Text>
              </View>
            )}
            {item.deadline && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} />
                <Text style={{ fontSize: 10, color: colors.textSecondary }}>Son: {item.deadline}</Text>
              </View>
            )}
            {item.dueDate && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} />
                <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                  {new Date(item.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                </Text>
              </View>
            )}
            {(item.tags || []).map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {item.completed && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <Text style={{ fontSize: 10, color: colors.success, fontWeight: '700' }}>Tamamlandı</Text>
              </View>
            )}
            {item.archived && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="archive-outline" size={12} color={colors.textSecondary} />
                <Text style={{ fontSize: 10, color: colors.textSecondary }}>Arşivlendi</Text>
              </View>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.border} style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header + Arama Kutusu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Proje, görev, not, etiket ara..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtre Sekmesi */}
      <View style={styles.filterBar}>
        {[
          { key: 'all', label: 'Tümü', icon: 'apps-outline' },
          { key: 'project', label: 'Projeler', icon: 'briefcase-outline' },
          { key: 'task', label: 'Görevler', icon: 'checkbox-outline' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && { backgroundColor: colors.accent }]}
            onPress={() => setFilter(f.key)}
          >
            <Ionicons name={f.icon} size={14} color={filter === f.key ? '#fff' : colors.textSecondary} />
            <Text style={[styles.filterTabText, filter === f.key && { color: '#fff' }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sonuçlar */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => `${item.type}-${item.id}-${idx}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            query.length > 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
                <Text style={styles.emptyDesc}>"{query}" için eşleşen proje veya görev yok.</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="flash-outline" size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>Aramaya Başla</Text>
                <Text style={styles.emptyDesc}>Proje adı, görev, not veya etiket yazın.</Text>
              </View>
            )
          }
        />
      )}

      {/* Sonuç sayısı */}
      {query.length > 0 && results.length > 0 && (
        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>{results.length} sonuç bulundu</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: insets.top + 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  backBtn: { padding: 6 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },

  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: `${colors.textSecondary}10`,
  },
  filterTabText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  listContent: { padding: 16, paddingBottom: 80 },

  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  stripe: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: { fontSize: 10, fontWeight: '700' },
  projectRef: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  resultDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: `${colors.accent}15`,
  },
  tagText: { fontSize: 10, color: colors.accent, fontWeight: '600' },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  resultCount: {
    position: 'absolute',
    bottom: insets.bottom + 16,
    alignSelf: 'center',
    backgroundColor: `${colors.accent}E0`,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resultCountText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
