import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform, Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { breakTaskByAI, summarizeNotesByAI } from '../services/api';

const { height } = Dimensions.get('window');

const PRIORITY_OPTIONS = [
  { value: 'Yüksek', label: '🔴 Yüksek', color: '#ef4444' },
  { value: 'Orta', label: '🟡 Orta', color: '#f59e0b' },
  { value: 'Düşük', label: '🟢 Düşük', color: '#10b981' },
];

const SUGGESTED_TAGS = ['React', 'Backend', 'Tasarım', 'Test', 'API', 'UI', 'Dokümantasyon', 'Bug', 'Özellik', 'Acil'];
const TAG_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#3b82f6','#06b6d4','#84cc16','#f97316'];

function getTagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export default function TaskNoteModal({ visible, task, onClose, onSave }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [noteContent, setNoteContent] = useState('');
  const [viewMode, setViewMode] = useState('edit');
  const [priority, setPriority] = useState('Orta');
  const [subtasks, setSubtasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newTagText, setNewTagText] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  useEffect(() => {
    if (task && visible) {
      setNoteContent(task.notes || '');
      setPriority(task.priority || 'Orta');
      setSubtasks(task.subtasks || []);
      setTags(task.tags || []);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setTaskTitle(task.title || task.text || '');
      setViewMode('edit');
    }
  }, [task, visible]);

  if (!task) return null;

  const handleSave = () => {
    if (dueDate) {
      const dateParts = dueDate.split('-');
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      const day = parseInt(dateParts[2], 10);
      
      const parsedDate = new Date(dueDate);
      if (
        isNaN(parsedDate.getTime()) ||
        dateParts.length !== 3 ||
        isNaN(year) || isNaN(month) || isNaN(day) ||
        year < 2020 || year > 2100 ||
        month < 1 || month > 12 ||
        day < 1 || day > 31
      ) {
        Alert.alert('Hata', 'Lütfen geçerli bir bitiş tarihi girin (Format: YYYY-MM-DD, Örn: 2026-06-30. Yıl 2020 ile 2100 arasında olmalıdır).');
        return;
      }
    }

    onSave(task._id || task.id, {
      title: taskTitle.trim(),
      notes: noteContent,
      dueDate: dueDate || null,
      priority,
      subtasks,
      tags
    });
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks(prev => [...prev, { id: Date.now().toString(), text: newSubtaskText.trim(), completed: false }]);
    setNewSubtaskText('');
  };

  const toggleSubtask = (id) => setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  const deleteSubtask = (id) => setSubtasks(prev => prev.filter(s => s.id !== id));

  const handleAIBreakdown = async () => {
    setIsAILoading(true);
    try {
      const res = await breakTaskByAI(task.title || task.text);
      if (res.subtasks && res.subtasks.length > 0) {
        setSubtasks(prev => [
          ...prev,
          ...res.subtasks.map((text, i) => ({ id: Date.now().toString() + i, text, completed: false }))
        ]);
      } else {
        Alert.alert('Bilgi', 'Alt gorev olusturulamadi.');
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        Alert.alert('Kota Doldu', 'AI kotasi doldu. Lutfen 1 dakika bekleyin.');
      } else {
        Alert.alert('Hata', 'Alt gorevler olusturulamadi. Lutfen tekrar deneyin.');
      }
      console.error(err);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!noteContent.trim()) {
      Alert.alert('Bilgi', 'Ozetlenecek not bulunamadi.');
      return;
    }
    setIsSummarizing(true);
    try {
      const res = await summarizeNotesByAI(noteContent);
      if (res.summary) setNoteContent(res.summary);
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        Alert.alert('Kota Doldu', 'AI kotasi doldu. Lutfen 1 dakika bekleyin.');
      } else {
        Alert.alert('Hata', 'Ozetleme basarisiz. Lutfen tekrar deneyin.');
      }
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const addTag = (text) => {
    const t = text.trim();
    if (!t || tags.includes(t)) return;
    setTags(prev => [...prev, t]);
    setNewTagText('');
  };
  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const completedSubs = subtasks.filter(s => s.completed).length;
  const subProgress = subtasks.length === 0 ? 0 : Math.round((completedSubs / subtasks.length) * 100);

  const formatDate = (ds) => {
    if (!ds) return '-';
    return new Date(ds).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'edit', icon: 'create-outline', label: 'Not' },
          { key: 'subtasks', icon: 'list-outline', label: 'Alt Görevler' },
          { key: 'tags', icon: 'pricetag-outline', label: 'Etiketler' },
          { key: 'preview', icon: 'eye-outline', label: 'Önizleme' },
          { key: 'history', icon: 'time-outline', label: 'Geçmiş' },
        ].map(tab => (
          <TouchableOpacity 
            key={tab.key} 
            style={[styles.tabBtn, viewMode === tab.key && styles.tabBtnActive]} 
            onPress={() => setViewMode(tab.key)}
          >
            <Ionicons name={tab.icon} size={16} color={viewMode === tab.key ? colors.accent : colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, viewMode === tab.key && { color: colors.accent, fontWeight: '700' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={styles.modalContent}>
            
            <View style={styles.header}>
              <View style={{ flex: 1, marginRight: 15 }}>
                <Text style={styles.headerTitle}>Görev Detayları</Text>
                <TextInput
                  style={[styles.headerSubtitle, { paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: colors.border || 'rgba(255,255,255,0.08)' }]}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  placeholder="Görev adı girin..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.priorityRow}>
              <Text style={styles.priorityLabel}>Öncelik:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {PRIORITY_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.priorityChip, priority === opt.value && { backgroundColor: opt.color, borderColor: opt.color }]}
                    onPress={() => setPriority(opt.value)}
                  >
                    <Text style={[styles.priorityText, priority === opt.value && { color: '#fff' }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Due Date */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border || 'rgba(255,255,255,0.06)' }}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>Bitis Tarihi:</Text>
              <TextInput
                style={{ flex: 1, color: colors.text, fontSize: 13, borderWidth: 1, borderColor: colors.border || 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.cardBg || 'rgba(255,255,255,0.04)' }}
                placeholder="YYYY-MM-DD (ornek: 2026-06-30)"
                placeholderTextColor={colors.textSecondary}
                value={dueDate}
                onChangeText={setDueDate}
                keyboardType="numeric"
              />
              {dueDate ? (
                <TouchableOpacity onPress={() => setDueDate('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {renderTabs()}

            <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 20 }}>
              
              {viewMode === 'edit' && (
                <View>
                  <TextInput
                    style={styles.textArea}
                    multiline
                    placeholder="Markdown formatında notlarınızı yazın..."
                    placeholderTextColor={colors.textSecondary}
                    value={noteContent}
                    onChangeText={setNoteContent}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: 'rgba(168, 85, 247, 0.1)', borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.3)', marginTop: 10 }]} 
                    onPress={handleSummarize}
                    disabled={isSummarizing}
                  >
                    <Ionicons name="sparkles" size={18} color="#a855f7" style={{ marginRight: 6 }} />
                    <Text style={[styles.saveBtnText, { color: '#a855f7' }]}>
                      {isSummarizing ? 'Özetleniyor...' : 'AI ile Özetle'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {viewMode === 'subtasks' && (
                <View>
                  {subtasks.length > 0 && (
                    <View style={styles.progressContainer}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>{completedSubs} / {subtasks.length} tamamlandı</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: subProgress === 100 ? colors.success : colors.accent }}>%{subProgress}</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${subProgress}%`, backgroundColor: subProgress === 100 ? colors.success : colors.accent }]} />
                      </View>
                    </View>
                  )}
                  {subtasks.map(sub => (
                    <View key={sub.id} style={styles.subtaskItem}>
                      <TouchableOpacity onPress={() => toggleSubtask(sub.id)} style={{ marginRight: 10 }}>
                        <Ionicons name={sub.completed ? "checkmark-circle" : "ellipse-outline"} size={24} color={sub.completed ? colors.success : colors.border} />
                      </TouchableOpacity>
                      <Text style={[styles.subtaskText, sub.completed && { textDecorationLine: 'line-through', color: colors.textSecondary }]}>{sub.text}</Text>
                      <TouchableOpacity onPress={() => deleteSubtask(sub.id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <View style={styles.addRow}>
                    <TextInput
                      style={styles.addInput}
                      placeholder="Yeni alt görev ekle..."
                      placeholderTextColor={colors.textSecondary}
                      value={newSubtaskText}
                      onChangeText={setNewSubtaskText}
                      onSubmitEditing={addSubtask}
                    />
                    <TouchableOpacity onPress={handleAIBreakdown} style={[styles.addBtn, { backgroundColor: 'rgba(168, 85, 247, 0.1)', marginRight: 10 }]} disabled={isAILoading}>
                      <Ionicons name="color-wand" size={24} color="#a855f7" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={addSubtask} style={styles.addBtn}>
                      <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {viewMode === 'tags' && (
                <View>
                  <View style={styles.tagsWrap}>
                    {tags.map(tag => (
                      <View key={tag} style={[styles.tagChip, { backgroundColor: getTagColor(tag) }]}>
                        <Text style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity onPress={() => removeTag(tag)}>
                          <Ionicons name="close" size={14} color="#fff" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <View style={styles.addRow}>
                    <TextInput
                      style={styles.addInput}
                      placeholder="Yeni etiket yaz..."
                      placeholderTextColor={colors.textSecondary}
                      value={newTagText}
                      onChangeText={setNewTagText}
                      onSubmitEditing={() => addTag(newTagText)}
                    />
                    <TouchableOpacity onPress={() => addTag(newTagText)} style={styles.addBtn}>
                      <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 15, marginBottom: 10 }}>Hızlı Ekle:</Text>
                  <View style={styles.tagsWrap}>
                    {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(t => (
                      <TouchableOpacity key={t} style={[styles.tagSuggestBtn, { borderColor: getTagColor(t) }]} onPress={() => addTag(t)}>
                        <Text style={{ color: getTagColor(t), fontSize: 12, fontWeight: '600' }}>+ {t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {viewMode === 'preview' && (
                <View style={styles.previewBox}>
                  <Text style={{ color: colors.textPrimary }}>{noteContent || 'Henüz not eklenmedi.'}</Text>
                </View>
              )}

              {viewMode === 'history' && (
                <View>
                  <Text style={styles.historyMeta}><Ionicons name="calendar-outline" size={12}/> Oluşturulma: {formatDate(task.createdAt)}</Text>
                  <Text style={styles.historyMeta}><Ionicons name="checkmark-circle-outline" size={12}/> Tamamlanma: {task.completedAt ? formatDate(task.completedAt) : 'Devam Ediyor'}</Text>
                  <View style={{ marginTop: 15 }}>
                    {task.history && task.history.length > 0 ? [...task.history].reverse().map((entry, idx) => (
                      <View key={idx} style={styles.historyItem}>
                        <View style={styles.historyDot} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.textPrimary, fontSize: 13 }}>{entry.action}</Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{formatDate(entry.timestamp)}</Text>
                        </View>
                      </View>
                    )) : (
                      <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>Geçmiş bulunmuyor.</Text>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Kaydet ve Kapat</Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.bg === '#060b18' ? '#1e293b' : '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  headerSubtitle: { fontSize: 14, color: colors.accent, fontWeight: '600', marginTop: 4 },
  closeBtn: { padding: 4, backgroundColor: colors.bg, borderRadius: 20 },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  priorityLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginRight: 10 },
  priorityChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    marginRight: 8,
  },
  priorityText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 15,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  body: {
    flex: 1,
  },
  textArea: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    minHeight: 200,
    padding: 15,
    fontSize: 15,
  },
  previewBox: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
    padding: 15,
  },
  progressContainer: { marginBottom: 15 },
  progressBarBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subtaskText: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    color: colors.textPrimary,
    marginRight: 10,
  },
  addBtn: {
    width: 46, height: 46,
    backgroundColor: colors.accent,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  tagSuggestBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1,
  },
  historyMeta: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  historyItem: { flexDirection: 'row', marginBottom: 12 },
  historyDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, marginTop: 4, marginRight: 10 },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
