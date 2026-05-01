import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

export default function StatsScreen({ navigation }) {
  const { colors, themeName } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const stats = [
    { label: 'Tamamlanan Görev', value: '12', icon: 'checkmark-circle-outline', color: '#6366f1' },
    { label: 'En Uzun Seri', value: '4 Gün', icon: 'flash-outline', color: '#10b981' },
    { label: 'En Verimli Gün', value: 'Salı', icon: 'ribbon-outline', color: '#f59e0b' },
    { label: 'En Verimli Hafta', value: '14. Hafta', icon: 'trending-up-outline', color: '#8b5cf6' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header - Web Style */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
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
               <Ionicons name="stats-chart" size={18} color={colors.accent} />
               <Text style={styles.chartTitle}>Son 7 Günlük Aktivite</Text>
            </View>
            <Text style={styles.chartSub}>Görev Tamamlama Sayısı</Text>
          </View>
          <View style={styles.chartPlaceholder}>
            {/* Grafik Çubukları Simülasyonu */}
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <View key={i} style={[styles.bar, { height: h, backgroundColor: i === 3 ? colors.accent : colors.border }]} />
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
             <Ionicons name="calendar-outline" size={24} color={colors.accent} />
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

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { marginBottom: 15, marginLeft: -5 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

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
    borderColor: colors.border
  },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  statValue: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 2 },

  chartCard: { backgroundColor: colors.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border },
  chartHeader: { marginBottom: 25 },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  chartTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  chartSub: { color: colors.textSecondary, fontSize: 12, marginLeft: 28 },
  chartPlaceholder: { height: 120, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10 },
  bar: { width: 12, borderRadius: 6 },
  chartDays: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingHorizontal: 5 },
  dayText: { color: colors.textSecondary, fontSize: 11 },

  tipCard: { backgroundColor: colors.bgCardHover, borderRadius: 20, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tipIconBox: { width: 50, height: 50, backgroundColor: colors.bgCard, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  tipTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  tipDesc: { color: colors.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 22 },
});
