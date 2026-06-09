import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  TextInput, Alert, ActivityIndicator, ScrollView, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createProject, createTask } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');
const PROJECT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#3b82f6', '#64748b'];

const CATEGORIES = [
  { id: 'all',      label: 'Tümü',           icon: 'grid-outline' },
  { id: 'yazilim',  label: 'Yazılım',         icon: 'code-outline' },
  { id: 'egitim',   label: 'Eğitim',          icon: 'school-outline' },
  { id: 'kariyer',  label: 'Kariyer',         icon: 'briefcase-outline' },
  { id: 'saglik',   label: 'Sağlık',          icon: 'heart-outline' },
  { id: 'kisisel',  label: 'Kişisel',         icon: 'star-outline' },
  { id: 'is',       label: 'İş & Girişim',   icon: 'trending-up-outline' },
  { id: 'yaratici', label: 'Yaratıcı',        icon: 'color-palette-outline' },
  { id: 'ev',       label: 'Ev & Yaşam',      icon: 'home-outline' },
];

const TEMPLATES = [
  // Yazılım
  { id: 'web',        category: 'yazilim',  title: 'Modern Web',       emoji: '🖥️', desc: '5 Hazır Görev',
    tasks: ['Proje mimarisini belirle', 'UI bileşen kütüphanesini ekle', 'API entegrasyonunu uygula', 'Responsive tasarım testleri yap', 'Deployment yap'] },
  { id: 'mobile',     category: 'yazilim',  title: 'Mobil Uygulama',   emoji: '📱', desc: '5 Hazır Görev',
    tasks: ['React Native ortamını kur', 'Navigasyon yapısı oluştur', 'Ekran tasarımlarını kodla', 'Push bildirim ekle', 'Store yayını yap'] },
  { id: 'fullstack',  category: 'yazilim',  title: 'Full-Stack SaaS',  emoji: '🚀', desc: '5 Hazır Görev',
    tasks: ['Veritabanı şemasını tasarla', 'Auth sistemini kur', 'API\'ları yaz ve test et', 'Ödeme sistemi ekle', 'Beta yayını yap'] },
  // Eğitim
  { id: 'sinav',      category: 'egitim',   title: 'Sınav Hazırlığı',  emoji: '📚', desc: '5 Hazır Görev',
    tasks: ['Çalışma programı oluştur', 'Zayıf konuları belirle', 'Konu tekrarı ve soru çöz', 'Deneme sınavı çöz', 'Hatalı konuları tekrar et'] },
  { id: 'tez',        category: 'egitim',   title: 'Tez / Ödev',       emoji: '✍️', desc: '5 Hazır Görev',
    tasks: ['Konu belirle ve onay al', 'Literatür taraması yap', 'Taslağı yaz', 'Bulguları analiz et', 'Kaynakçayı düzenle'] },
  { id: 'dil',        category: 'egitim',   title: 'Dil Öğrenme',      emoji: '🌍', desc: '5 Hazır Görev',
    tasks: ['Öğrenme kaynağını seç', 'Temel kelimeler öğren', 'Cümle yapısını çalış', 'Günlük konuşma pratiği', 'Seviye testi yap'] },
  // Kariyer
  { id: 'is_basvuru', category: 'kariyer',  title: 'İş Başvurusu',     emoji: '💼', desc: '5 Hazır Görev',
    tasks: ['Özgeçmişi güncelle', 'LinkedIn\'i optimize et', 'Hedef şirketleri listele', 'Başvuruları gönder', 'Mülakat hazırlığı yap'] },
  { id: 'freelance',  category: 'kariyer',  title: 'Freelance',        emoji: '🧑‍💻', desc: '5 Hazır Görev',
    tasks: ['Uzmanlık alanını belirle', 'Portföy hazırla', 'Profil oluştur', 'İlk teklifi gönder', 'Fatura süreçlerini düzenle'] },
  // Sağlık
  { id: 'fitness',    category: 'saglik',   title: 'Fitness Planı',    emoji: '💪', desc: '5 Hazır Görev',
    tasks: ['Fitness seviyeni ölç', 'Antrenman programı oluştur', 'Beslenme planını düzenle', 'İlk 2 hafta değerlendirme', 'Programı güncelle'] },
  { id: 'zihin',      category: 'saglik',   title: 'Zihinsel Sağlık',  emoji: '🧘', desc: '5 Hazır Görev',
    tasks: ['Stres kaynaklarını listele', 'Meditasyon rutini başlat', 'Uyku düzenini sabitle', 'Dijital detoks günü uygula', 'Aylık değerlendirme yap'] },
  // Kişisel
  { id: 'kitap',      category: 'kisisel',  title: 'Kitap Okuma',      emoji: '📖', desc: '5 Hazır Görev',
    tasks: ['Okunacak kitapları listele', 'Günlük sayfa hedefi belirle', '1. Kitabı bitir ve not al', '2. Kitabı bitir', 'Sonraki listeyi oluştur'] },
  { id: 'habit',      category: 'kisisel',  title: '30 Günlük Alışkanlık', emoji: '✅', desc: '5 Hazır Görev',
    tasks: ['Alışkanlığı net tanımla', 'Engelleri listele', 'İlk 10 günü tamamla', '20. günü tamamla', '30. gün başarıyı kutla'] },
  // İş & Girişim
  { id: 'girisim',    category: 'is',       title: 'Startup',          emoji: '🏆', desc: '5 Hazır Görev',
    tasks: ['Fikri doğrula', 'İş modeli belirle', 'MVP geliştir', 'İlk müşterilere ulaş', 'Geri bildirime göre iyileştir'] },
  { id: 'pazarlama',  category: 'is',       title: 'Pazarlama',        emoji: '📣', desc: '5 Hazır Görev',
    tasks: ['Hedef kitle analizi yap', 'Rakip analizi yap', 'İçerik takvimi oluştur', 'Kampanyayı başlat', 'Sonuçları analiz et'] },
  // Yaratıcı
  { id: 'youtube',    category: 'yaratici', title: 'YouTube Kanalı',   emoji: '🎬', desc: '5 Hazır Görev',
    tasks: ['Kanal konsepti belirle', 'Kanal sayfasını hazırla', 'İlk 3 videoyu çek', 'SEO optimizasyonu yap', 'Topluluk oluştur'] },
  { id: 'muzik',      category: 'yaratici', title: 'Müzik Projesi',    emoji: '🎵', desc: '5 Hazır Görev',
    tasks: ['Şarkı listesini belirle', 'Besteleri ve sözleri yaz', 'Stüdyo kaydı yap', 'Miksleme tamamla', 'Platforma yükle'] },
  // Ev & Yaşam
  { id: 'tasinak',    category: 'ev',       title: 'Taşınma Planı',    emoji: '🏠', desc: '5 Hazır Görev',
    tasks: ['Gereksizleri ayıkla', 'Nakliye firması tut', 'Ambalaj malzemesi al', 'Adres değişikliği bildir', 'Taşın ve düzenle'] },
  { id: 'dugun',      category: 'ev',       title: 'Düğün Planı',      emoji: '💍', desc: '5 Hazır Görev',
    tasks: ['Bütçe ve davetli listesi', 'Mekan ve catering rezervasyonu', 'Davetiye gönder', 'Kıyafet ve dekorasyon', 'Son kontrolleri yap'] },
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
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [deadlineError, setDeadlineError] = useState('');

  const PRIORITIES = ['Düşük', 'Orta', 'Yüksek'];
  const cyclePriority = () => {
    const idx = PRIORITIES.indexOf(priority);
    setPriority(PRIORITIES[(idx + 1) % PRIORITIES.length]);
  };
  const getPriorityColor = () => {
    if (priority === 'Yüksek') return colors.danger;
    if (priority === 'Düşük') return colors.success;
    return colors.warning;
  };

  const filteredTemplates = activeCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory);

  const handleTemplateSelect = (t) => {
    setSelectedTemplate(t.id === selectedTemplate ? null : t.id);
    if (t.id !== selectedTemplate) {
      setTitle(t.title);
      setDesc(t.emoji + ' ' + t.title + ' projesi');
    }
  };

  // gg.aa.yyyy formatını otomatik olarak ekle (nokta ekleme)
  const handleDeadlineChange = (text) => {
    // Sadece rakam ve noktaya izin ver
    let cleaned = text.replace(/[^0-9.]/g, '');

    // Otomatik nokta ekle
    if (cleaned.length === 2 && deadline.length === 1) cleaned = cleaned + '.';
    if (cleaned.length === 5 && deadline.length === 4) cleaned = cleaned + '.';

    // Maksimum 10 karakter (gg.aa.yyyy)
    if (cleaned.length > 10) return;

    setDeadline(cleaned);
    setDeadlineError('');
  };

  // Tarih validasyonu: format, gerçek tarih ve geçmişte olmaması
  const validateDeadline = (value) => {
    if (!value) return true; // Boş bırakılabilir

    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = value.match(regex);
    if (!match) {
      setDeadlineError('Tarih formatı: gg.aa.yyyy olmalıdır');
      return false;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (year < 2020 || year > 2100) {
      setDeadlineError('Yıl 2020 ile 2100 arasında olmalıdır');
      return false;
    }
    if (month < 1 || month > 12) {
      setDeadlineError('Ay 01-12 arasında olmalıdır');
      return false;
    }
    if (day < 1 || day > 31) {
      setDeadlineError('Gün 01-31 arasında olmalıdır');
      return false;
    }

    // JavaScript Date ile gerçek tarih kontrolü (örn: 31 Şubat geçersiz)
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      setDeadlineError('Geçersiz tarih (örn: 31 Şubat olamaz)');
      return false;
    }

    // Geçmiş tarih kontrolü (bugünden önce olamaz)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      setDeadlineError('Teslim tarihi bugünden önce olamaz');
      return false;
    }

    setDeadlineError('');
    return true;
  };

  const handleCreate = async () => {
    if (!title.trim()) { Alert.alert('Hata', 'Proje başlığı boş bırakılamaz'); return; }
    if (!validateDeadline(deadline)) return;
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const savedProject = await createProject({
        title: title.trim(),
        description: desc.trim(),
        color: selectedColor,
        priority,
        deadline,
        user: userId,
      });

      // Şablon seçildiyse şablon görevlerini ekle
      if (selectedTemplateData && selectedTemplateData.tasks) {
        await Promise.all(selectedTemplateData.tasks.map(taskTitle => 
          createTask(savedProject.id, {
            title: taskTitle,
            weekIndex: 1,
            priority: 'medium',
            dependsOn: null
          })
        ));
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', 'Proje oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplateData = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Yeni Proje Başlat</Text>
          <Text style={styles.headerSub}>Şablon seç veya sıfırdan oluştur</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Kategori Filtreleri */}
        <Text style={styles.sectionLabel}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }} style={{ marginBottom: 16 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catBtn, activeCategory === cat.id && styles.catBtnActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons name={cat.icon} size={13} color={activeCategory === cat.id ? '#fff' : colors.textSecondary} style={{ marginRight: 5 }} />
              <Text style={[styles.catBtnText, activeCategory === cat.id && { color: '#fff' }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Şablon Kartları */}
        <Text style={styles.sectionLabel}>Şablon Seç <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>(İsteğe Bağlı)</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} style={{ marginBottom: 16 }}>
          {filteredTemplates.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.templateCard, selectedTemplate === t.id && styles.activeTemplateCard]}
              onPress={() => handleTemplateSelect(t)}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{t.emoji}</Text>
              <Text style={[styles.templateTitle, selectedTemplate === t.id && { color: colors.accent }]}>{t.title}</Text>
              <Text style={styles.templateDesc}>{t.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Görev Önizleme */}
        {selectedTemplateData && (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>{selectedTemplateData.emoji} Bu şablonla eklenecek görevler:</Text>
            {selectedTemplateData.tasks.map((task, idx) => (
              <View key={idx} style={styles.previewRow}>
                <Text style={styles.previewNum}>{idx + 1}.</Text>
                <Text style={styles.previewTask}>{task}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Proje Başlığı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: YKS Hazırlık, Fitness Planı..."
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Proje hakkında kısa bilgi..."
              placeholderTextColor={colors.textSecondary}
              value={desc}
              onChangeText={setDesc}
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Öncelik</Text>
              <TouchableOpacity style={[styles.selector, { borderColor: getPriorityColor() }]} onPress={cyclePriority}>
                <Text style={[styles.selectorText, { color: getPriorityColor(), fontWeight: '700' }]}>{priority}</Text>
                <Ionicons name="swap-vertical" size={16} color={getPriorityColor()} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Teslim Tarihi</Text>
              <TextInput
                style={[styles.input, { height: 50, borderColor: deadlineError ? colors.danger : colors.border }]}
                placeholder="gg.aa.yyyy"
                placeholderTextColor={colors.textSecondary}
                value={deadline}
                onChangeText={handleDeadlineChange}
                onBlur={() => validateDeadline(deadline)}
                keyboardType="numeric"
                maxLength={10}
              />
              {deadlineError ? (
                <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                  ⚠ {deadlineError}
                </Text>
              ) : null}
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
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Projeyi Kaydet ve Başlat 🚀</Text>}
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
  headerTitle: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  scrollContent: { paddingBottom: 100 },
  sectionLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginLeft: 20, marginBottom: 10 },

  catBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 8 },
  catBtnActive: { backgroundColor: colors.accent },
  catBtnText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },

  templateCard: { width: 130, backgroundColor: colors.bgCard, borderRadius: 16, padding: 14, marginRight: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  activeTemplateCard: { borderColor: colors.accent, backgroundColor: colors.bgCardHover },
  templateTitle: { color: colors.textPrimary, fontSize: 11, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  templateDesc: { color: colors.textSecondary, fontSize: 10 },

  previewBox: { marginHorizontal: 20, marginBottom: 20, padding: 16, backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)' },
  previewTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 10 },
  previewRow: { flexDirection: 'row', marginBottom: 6 },
  previewNum: { color: colors.accent, fontWeight: '700', marginRight: 6, fontSize: 13 },
  previewTask: { color: colors.textPrimary, fontSize: 13, flex: 1 },

  form: { paddingHorizontal: 20, gap: 18 },
  inputGroup: { gap: 8 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: colors.bgCard, borderRadius: 12, padding: 14, color: colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', gap: 15 },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 12, padding: 14, borderWidth: 1 },
  selectorText: { color: colors.textPrimary, fontSize: 14 },
  colorPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  colorOption: { width: 34, height: 34, borderRadius: 17 },
  activeColor: { borderWidth: 3, borderColor: colors.textPrimary },
  submitBtn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
