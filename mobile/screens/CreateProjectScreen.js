import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, StatusBar, 
  TextInput, Alert, ActivityIndicator, ScrollView, Dimensions 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { createProject } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');
const PROJECT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#3b82f6', '#64748b'];

const TEMPLATES = [
  { id: 'empty', title: 'Boş Proje', desc: 'Sıfırdan Başla', icon: 'close-circle-outline' },
  { id: 'web', title: 'Modern Web Projesi', desc: '5 Hazır Görev', icon: 'desktop-outline' },
  { id: 'mobile', title: 'Mobil Uygulama', desc: '5 Hazır Görev', icon: 'smartphone-outline' },
  { id: 'saas', title: 'Full-Stack SaaS', desc: '5 Hazır Görev', icon: 'layers-outline' },
];

export default function CreateProjectScreen({ navigation }) {
  const { colors, themeName } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
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
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header - Web Style */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Yeni Proje Başlat</Text>
          <Text style={styles.headerSub}>Projenin detaylarını belirleyerek hedefine bir adım daha yaklaş.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Templates Section */}
        <Text style={styles.sectionLabel}>Bir Şablonla Hızlan (Opsiyonel)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} style={styles.templateScroll}>
          {TEMPLATES.map(t => (
            <TouchableOpacity 
              key={t.id} 
              style={[styles.templateCard, selectedTemplate === t.id && styles.activeTemplateCard]}
              onPress={() => setSelectedTemplate(t.id)}
            >
              <Ionicons name={t.icon} size={24} color={selectedTemplate === t.id ? colors.accent : colors.textSecondary} />
              <Text style={[styles.templateTitle, selectedTemplate === t.id && { color: colors.accent }]}>{t.title}</Text>
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
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Proje hakkında kısa bilgi..."
              placeholderTextColor={colors.textSecondary}
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
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Teslim Tarihi</Text>
              <TouchableOpacity style={styles.selector}>
                <Text style={styles.selectorText}>gg.aa.yyyy</Text>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
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

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  closeBtn: { marginBottom: 15, marginLeft: -5 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  scrollContent: { paddingBottom: 100 },
  sectionLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginLeft: 20, marginBottom: 15 },
  templateScroll: { marginBottom: 30 },
  templateCard: { width: 140, backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginRight: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  activeTemplateCard: { borderColor: colors.accent, backgroundColor: colors.bgCardHover },
  templateTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  templateDesc: { color: colors.textSecondary, fontSize: 10, marginTop: 4 },

  form: { paddingHorizontal: 20, gap: 20 },
  inputGroup: { gap: 8 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: colors.bgCard, borderRadius: 12, padding: 15, color: colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', gap: 15 },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border },
  selectorText: { color: colors.textPrimary, fontSize: 14 },
  
  colorPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 20, justifyContent: 'flex-start' },
  colorOption: { width: 36, height: 36, borderRadius: 18 },
  activeColor: { borderWidth: 3, borderColor: colors.textPrimary },

  submitBtn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 10, shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
