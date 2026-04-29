import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, StatusBar, 
  TextInput, Alert, ActivityIndicator, ScrollView, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { createProject } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const PROJECT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#3b82f6', '#64748b'];

const TEMPLATES = [
  { id: 'empty', title: 'Boş Proje', desc: 'Sıfırdan Başla', icon: 'close-circle-outline' },
  { id: 'web', title: 'Modern Web Projesi', desc: '5 Hazır Görev', icon: 'desktop-outline' },
  { id: 'mobile', title: 'Mobil Uygulama', desc: '5 Hazır Görev', icon: 'smartphone-outline' },
  { id: 'saas', title: 'Full-Stack SaaS', desc: '5 Hazır Görev', icon: 'layers-outline' },
];

export default function CreateProjectScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('Orta');
  const [deadline, setDeadline] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState('empty');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Proje başlığı boş bırakılamaz');
      return;
    }
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      await createProject({
        title: title.trim(),
        description: desc.trim(),
        color: selectedColor,
        priority,
        deadline,
        user: userId,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', 'Proje oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header - Web Style */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Yeni Proje Başlat</Text>
          <Text style={styles.headerSub}>Projenin detaylarını belirleyerek hedefine bir adım daha yaklaş.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Templates Section */}
        <Text style={styles.sectionLabel}>Bir Şablonla Hızlan (Opsiyonel)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
          {TEMPLATES.map(t => (
            <TouchableOpacity 
              key={t.id} 
              style={[styles.templateCard, selectedTemplate === t.id && styles.activeTemplateCard]}
              onPress={() => setSelectedTemplate(t.id)}
            >
              <Ionicons name={t.icon} size={24} color={selectedTemplate === t.id ? COLORS.accent : '#64748b'} />
              <Text style={[styles.templateTitle, selectedTemplate === t.id && styles.activeTemplateText]}>{t.title}</Text>
              <Text style={styles.templateDesc}>{t.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Proje Başlığı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: VeloPath Web Geliştirme"
              placeholderTextColor="#334155"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Proje hakkında kısa bilgi..."
              placeholderTextColor="#334155"
              value={desc}
              onChangeText={setDesc}
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Öncelik Seviyesi</Text>
              <TouchableOpacity style={styles.selector}>
                <Text style={styles.selectorText}>{priority}</Text>
                <Ionicons name="chevron-down" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Teslim Tarihi</Text>
              <TouchableOpacity style={styles.selector}>
                <Text style={styles.selectorText}>gg.aa.yyyy</Text>
                <Ionicons name="calendar-outline" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Proje Rengi</Text>
          <View style={styles.colorPicker}>
            {PROJECT_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.activeColor]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Projeyi Kaydet ve Başlat</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0e14' },
  header: { paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
  closeBtn: { marginBottom: 15, marginLeft: -5 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: '#64748b', marginTop: 4 },

  scrollContent: { paddingBottom: 50 },
  sectionLabel: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 20, marginBottom: 15 },
  templateScroll: { paddingLeft: 20, marginBottom: 30 },
  templateCard: { width: 140, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  activeTemplateCard: { borderColor: COLORS.accent, backgroundColor: 'rgba(99, 102, 241, 0.05)' },
  templateTitle: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  activeTemplateText: { color: COLORS.accent },
  templateDesc: { color: '#475569', fontSize: 10, marginTop: 4 },

  form: { paddingHorizontal: 20, gap: 20 },
  inputGroup: { gap: 8 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 15, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row', gap: 15 },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  selectorText: { color: '#fff', fontSize: 14 },
  
  colorPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  colorOption: { width: 34, height: 34, borderRadius: 17 },
  activeColor: { borderWidth: 3, borderColor: '#fff' },

  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 10, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
