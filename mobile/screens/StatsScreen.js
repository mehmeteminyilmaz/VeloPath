import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function StatsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>İstatistikler</Text>
      
      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={32} color={COLORS.accent} />
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Biten Görev</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time" size={32} color="#fbbf24" />
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Devam Eden</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="flame" size={32} color="#f87171" />
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Verimlilik</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="rocket" size={32} color="#10b981" />
          <Text style={styles.statValue}>4</Text>
          <Text style={styles.statLabel}>Aktif Proje</Text>
        </View>
      </View>

      <Text style={styles.subHeader}>Haftalık İlerleme</Text>
      <View style={styles.chartPlaceholder}>
        <View style={[styles.bar, { height: '40%' }]} />
        <View style={[styles.bar, { height: '60%' }]} />
        <View style={[styles.bar, { height: '80%' }]} />
        <View style={[styles.bar, { height: '50%' }]} />
        <View style={[styles.bar, { height: '90%', backgroundColor: COLORS.accent }]} />
        <View style={[styles.bar, { height: '70%' }]} />
        <View style={[styles.bar, { height: '30%' }]} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Gelişim Analizi</Text>
        <Text style={styles.infoDesc}>
          Bu hafta geçen haftaya göre %15 daha fazla görev tamamladın. Harika gidiyorsun!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
  },
  header: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  subHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.card,
    width: '48%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 5,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: COLORS.card,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  bar: {
    width: 25,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 5,
  },
  infoCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginTop: 30,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    marginBottom: 50,
  },
  infoTitle: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  infoDesc: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  }
});
