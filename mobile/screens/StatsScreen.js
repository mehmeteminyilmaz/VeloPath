import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function StatsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const stats = [
    { label: 'Tamamlanan Görev', value: '12', icon: 'checkmark-circle-outline', color: '#6366f1' },
    { label: 'En Uzun Seri', value: '4 Gün', icon: 'flash-outline', color: '#10b981' },
    { label: 'En Verimli Gün', value: 'Salı', icon: 'ribbon-outline', color: '#f59e0b' },
    { label: 'En Verimli Hafta', value: '14. Hafta', icon: 'trending-up-outline', color: '#8b5cf6' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header - Web Style */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Verimlilik Raporu</Text>
          <Text style={styles.headerSub}>Çalışma alışkanlıklarını analiz et ve performansını artır.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stat Grid - Web Style */}
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

        {/* Activity Chart Placeholder - Web Style */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
               <Ionicons name="stats-chart" size={18} color={COLORS.accent} />
               <Text style={styles.chartTitle}>Son 7 Günlük Aktivite</Text>
            </View>
            <Text style={styles.chartSub}>Görev Tamamlama Sayısı</Text>
          </View>
          <View style={styles.chartPlaceholder}>
            {/* Grafik Çubukları Simülasyonu */}
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <View key={i} style={[styles.bar, { height: h, backgroundColor: i === 3 ? COLORS.accent : 'rgba(255,255,255,0.1)' }]} />
            ))}
          </View>
          <View style={styles.chartDays}>
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
              <Text key={d} style={styles.dayText}>{d}</Text>
            ))}
          </View>
        </View>

        {/* Tip Card - Web Style */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconBox}>
             <Ionicons name="calendar-outline" size={24} color={COLORS.accent} />
          </View>
          <Text style={styles.tipTitle}>İstikrarlı İlerleme</Text>
          <Text style={styles.tipDesc}>
            Görevlerini küçük parçalara bölmek tamamlama hızını %40 artırabilir. Haftalık planlarını buna göre düzenlemeyi dene!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0e14' }, // Web'in derin karanlığı
  header: { paddingHorizontal: 20, paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { marginBottom: 15, marginLeft: -5 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: '#64748b', marginTop: 4 },

  scrollContent: { padding: 20, gap: 20, paddingBottom: 100 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { 
    width: (width - 52) / 2, 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 16, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 },

  chartCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  chartHeader: { marginBottom: 25 },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  chartTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  chartSub: { color: '#475569', fontSize: 12, marginLeft: 28 },
  chartPlaceholder: { height: 120, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10 },
  bar: { width: 12, borderRadius: 6 },
  chartDays: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingHorizontal: 5 },
  dayText: { color: '#475569', fontSize: 11 },

  tipCard: { backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 20, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.1)' },
  tipIconBox: { width: 50, height: 50, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  tipTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  tipDesc: { color: '#94a3b8', textAlign: 'center', fontSize: 14, lineHeight: 22 },
});
