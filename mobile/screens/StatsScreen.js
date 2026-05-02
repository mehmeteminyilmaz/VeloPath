import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, Dimensions, ActivityIndicator, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAllData } from '../services/api';

const { width } = Dimensions.get('window');

export default function StatsScreen({ navigation }) {
  const { colors, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;
      const data = await fetchAllData(uid);
      if (data) setProjects(data);
    } catch (err) {
      console.error('Stats veri yükleme hatası:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  // --- Gerçek istatistikleri hesapla ---
  const isTaskDone = (t) => t.completed === true || t.status === 'done';
  const allTasks = projects.flatMap(p => p.tasks || []);
  const completedTasks = allTasks.filter(isTaskDone);
  const pendingTasks = allTasks.filter(t => !isTaskDone(t));
  const activeProjects = projects.filter(p => !p.archived);
  const productivity = allTasks.length > 0
    ? Math.round((completedTasks.length / allTasks.length) * 100)
    : 0;

  // Haftalık görev dağılımı (weekIndex 1–7)
  const weekCounts = Array.from({ length: 7 }, (_, i) =>
    allTasks.filter(t => t.week === i + 1).length
  );
  const maxWeekCount = Math.max(...weekCounts, 1);
  const maxWeekIdx = weekCounts.indexOf(Math.max(...weekCounts));

  const stats = [
    { label: 'Tamamlanan Görev', value: completedTasks.length.toString(), icon: 'checkmark-circle-outline', color: colors.accent },
    { label: 'Bekleyen Görev', value: pendingTasks.length.toString(), icon: 'time-outline', color: colors.warning },
    { label: 'Aktif Projeler', value: activeProjects.length.toString(), icon: 'briefcase-outline', color: colors.success },
    { label: 'Verimlilik', value: `%${productivity}`, icon: 'trending-up-outline', color: '#8b5cf6' },
  ];

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
          <Text style={styles.headerTitle}>Verimlilik Raporu</Text>
          <Text style={styles.headerSub}>Çalışma alışkanlıklarını analiz et.</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* İstatistik Grid */}
        <View style={styles.grid}>
          {stats.map((item, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statLabel} numberOfLines={2}>{item.label}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Haftalık Çubuk Grafik */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="stats-chart" size={18} color={colors.accent} />
              <Text style={styles.chartTitle}>Haftalık Görev Dağılımı</Text>
            </View>
            <Text style={styles.chartSub}>Hafta bazında toplam görev sayısı</Text>
          </View>

          {allTasks.length === 0 ? (
            <View style={styles.emptyChart}>
              <Ionicons name="bar-chart-outline" size={40} color={colors.border} />
              <Text style={styles.emptyChartText}>Henüz veri yok</Text>
            </View>
          ) : (
            <>
              <View style={styles.chartPlaceholder}>
                {weekCounts.map((count, i) => {
                  const barH = maxWeekCount > 0 ? Math.max((count / maxWeekCount) * 100, count > 0 ? 6 : 0) : 0;
                  const isMax = i === maxWeekIdx && count > 0;
                  return (
                    <View key={i} style={styles.barWrapper}>
                      {count > 0 && <Text style={[styles.barCount, isMax && { color: colors.accent }]}>{count}</Text>}
                      <View style={[styles.bar, {
                        height: barH,
                        backgroundColor: isMax ? colors.accent : colors.border,
                      }]} />
                    </View>
                  );
                })}
              </View>
              <View style={styles.chartLabels}>
                {['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'].map(d => (
                  <Text key={d} style={styles.dayText}>{d}</Text>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Özet Kart */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconBox}>
            <Ionicons name="trophy-outline" size={26} color={colors.accent} />
          </View>
          <Text style={styles.summaryTitle}>
            {allTasks.length === 0
              ? 'Veri bekleniyor'
              : maxWeekIdx >= 0 && weekCounts[maxWeekIdx] > 0
                ? `En Yoğun Hafta: ${maxWeekIdx + 1}. Hafta`
                : 'İyi gidiyorsunuz!'}
          </Text>
          <Text style={styles.summaryDesc}>
            {allTasks.length === 0
              ? 'Projelerinize görev ekleyerek istatistiklerinizi burada takip edebilirsiniz.'
              : `Toplam ${allTasks.length} görevin ${completedTasks.length} tanesi tamamlandı. ${productivity > 0 ? `Verimlilik oranınız %${productivity}.` : ''}`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: insets.top + 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 15,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  scrollContent: { padding: 20, gap: 20, paddingBottom: 100 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  statLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 2 },

  chartCard: { backgroundColor: colors.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border },
  chartHeader: { marginBottom: 20 },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  chartTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  chartSub: { color: colors.textSecondary, fontSize: 12, marginLeft: 28 },

  emptyChart: { height: 100, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyChartText: { color: colors.textSecondary, fontSize: 13 },

  chartPlaceholder: { height: 120, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 5 },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barCount: { color: colors.textSecondary, fontSize: 9, marginBottom: 4, fontWeight: '700' },
  bar: { width: 14, borderRadius: 7 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 5 },
  dayText: { flex: 1, textAlign: 'center', color: colors.textSecondary, fontSize: 11 },

  summaryCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryIconBox: {
    width: 54, height: 54,
    backgroundColor: `${colors.accent}15`,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  summaryDesc: { color: colors.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 22 },
});
