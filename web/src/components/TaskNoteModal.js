import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Check, Clock, Calendar, History, Edit3, CheckCircle2, RotateCcw, ArrowRight, PlusCircle, ListChecks, Trash2, Plus, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PRIORITY_OPTIONS = [
  { value: 'Yüksek', label: '🔴 Yüksek', color: 'var(--danger)' },
  { value: 'Orta',   label: '🟡 Orta',   color: 'var(--status-low)' },
  { value: 'Düşük',  label: '🟢 Düşük',  color: 'var(--status-high)' },
];

// Önerilen hızlı etiketler
const SUGGESTED_TAGS = ['React', 'Backend', 'Tasarım', 'Test', 'API', 'UI', 'Dokümantasyon', 'Bug', 'Özellik', 'Acil'];

const TAG_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b',
  '#10b981','#3b82f6','#06b6d4','#84cc16','#f97316',
];
function getTagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

const TaskNoteModal = ({ task, projectId, onClose, onSave, onPriorityChange, onSubtasksChange, onTagsChange }) => {
  const [noteContent, setNoteContent] = useState(task.notes || '');
  const [viewMode, setViewMode] = useState('edit');
  const [priority, setPriority] = useState(task.priority || 'Orta');
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [tags, setTags] = useState(task.tags || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newTagText, setNewTagText] = useState('');

  const handleSave = () => {
    onSave(task.id, noteContent);
    if (onPriorityChange && priority !== task.priority) onPriorityChange(task.id, priority);
    if (onSubtasksChange) onSubtasksChange(task.id, subtasks);
    if (onTagsChange) onTagsChange(task.id, tags);
    onClose();
  };

  /* ---------- Subtask helpers ---------- */
  const addSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks(prev => [...prev, { id: Date.now(), text: newSubtaskText.trim(), completed: false }]);
    setNewSubtaskText('');
  };
  const toggleSubtask = (id) => setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  const deleteSubtask = (id) => setSubtasks(prev => prev.filter(s => s.id !== id));

  /* ---------- Tag helpers ---------- */
  const addTag = (text) => {
    const t = text.trim();
    if (!t || tags.includes(t)) return;
    setTags(prev => [...prev, t]);
    setNewTagText('');
  };
  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  /* ---------- Progress helpers ---------- */
  const completedSubs = subtasks.filter(s => s.completed).length;
  const subProgress = subtasks.length === 0 ? 0 : Math.round((completedSubs / subtasks.length) * 100);

  const formatDate = (ds) => {
    if (!ds) return '-';
    return new Date(ds).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getActivityIcon = (action) => {
    if (action.includes('oluşturdu'))  return <PlusCircle size={14} />;
    if (action.includes('tamamlandı')) return <CheckCircle2 size={14} color="var(--accent)" />;
    if (action.includes('aktif'))      return <RotateCcw size={14} color="var(--status-low)" />;
    if (action.includes('notunu'))     return <Edit3 size={14} />;
    if (action.includes('taşıdı'))    return <ArrowRight size={14} />;
    if (action.includes('önceliğini')) return <span style={{ fontSize: 12 }}>⚡</span>;
    if (action.includes('alt'))        return <ListChecks size={14} />;
    if (action.includes('etiket'))     return <Tag size={14} />;
    return <Clock size={14} />;
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="note-modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>

        {/* ── Header ── */}
        <div className="note-modal-header">
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>Görev Detayları</h3>
            <p style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '10px' }}>{task.text}</p>
            {/* Öncelik Seçici */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Öncelik:</span>
              <div className="task-priority-selector">
                {PRIORITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value)}
                    className={`priority-chip ${priority === opt.value ? 'active' : ''}`}
                    style={{ '--chip-color': opt.color }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* ── Tabs ── */}
        <div className="note-tabs">
          {[
            { key: 'edit',     icon: <Edit3 size={15} />,     label: 'Not' },
            { key: 'subtasks', icon: <ListChecks size={15} />, label: 'Alt Görevler', badge: subtasks.length > 0 ? `${completedSubs}/${subtasks.length}` : null },
            { key: 'tags',     icon: <Tag size={15} />,        label: 'Etiketler',    badge: tags.length > 0 ? tags.length : null },
            { key: 'preview',  icon: <Check size={15} />,      label: 'Önizleme' },
            { key: 'history',  icon: <History size={15} />,    label: 'Aktivite' },
          ].map(tab => (
            <button key={tab.key} className={`note-tab ${viewMode === tab.key ? 'active' : ''}`} onClick={() => setViewMode(tab.key)}>
              <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>{tab.icon}</span>
              {tab.label}
              {tab.badge != null && <span className="subtask-tab-badge">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="note-body" style={{ minHeight: 260 }}>

          {/* Not Düzenle */}
          {viewMode === 'edit' && (
            <textarea
              className="note-textarea"
              placeholder="Markdown formatında notlarınızı yazın... (Örn: # Başlık, - Liste, **Kalın**)"
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              autoFocus
            />
          )}

          {/* Alt Görevler */}
          {viewMode === 'subtasks' && (
            <div className="subtasks-container">
              {subtasks.length > 0 && (
                <div className="subtask-progress-area">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{completedSubs} / {subtasks.length} tamamlandı</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: subProgress === 100 ? 'var(--accent)' : 'var(--primary)' }}>%{subProgress}</span>
                  </div>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: `${subProgress}%`, background: subProgress === 100 ? 'var(--accent)' : 'var(--primary)' }} />
                  </div>
                </div>
              )}
              <div className="subtask-list">
                {subtasks.length === 0 ? (
                  <div className="subtask-empty">
                    <ListChecks size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                    <p>Henüz alt görev yok.</p>
                  </div>
                ) : subtasks.map(sub => (
                  <div key={sub.id} className={`subtask-item ${sub.completed ? 'subtask-done' : ''}`}>
                    <button className="subtask-check-btn" onClick={() => toggleSubtask(sub.id)}>
                      {sub.completed ? <CheckCircle2 size={18} color="var(--accent)" /> : <div className="subtask-circle" />}
                    </button>
                    <span className="subtask-text">{sub.text}</span>
                    <button className="subtask-delete-btn" onClick={() => deleteSubtask(sub.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="subtask-add-row">
                <input
                  type="text"
                  className="note-textarea"
                  style={{ resize: 'none', height: 'auto', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }}
                  placeholder="Yeni alt görev ekle... (Enter)"
                  value={newSubtaskText}
                  onChange={e => setNewSubtaskText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                />
                <button className="subtask-add-btn" onClick={addSubtask}><Plus size={18} /></button>
              </div>
            </div>
          )}

          {/* Etiketler */}
          {viewMode === 'tags' && (
            <div className="tags-panel">
              {/* Mevcut etiketler */}
              <div className="tags-current">
                {tags.length === 0 ? (
                  <div className="subtask-empty">
                    <Tag size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                    <p>Henüz etiket eklenmedi.</p>
                  </div>
                ) : (
                  <div className="tag-chips-wrap">
                    {tags.map(tag => (
                      <span key={tag} className="tag-chip" style={{ '--tag-color': getTagColor(tag) }}>
                        {tag}
                        <button className="tag-remove-btn" onClick={() => removeTag(tag)} title="Kaldır">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Etiket ekle */}
              <div className="tag-add-row">
                <input
                  type="text"
                  className="note-textarea"
                  style={{ resize: 'none', height: 'auto', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }}
                  placeholder="Yeni etiket yaz... (Enter)"
                  value={newTagText}
                  onChange={e => setNewTagText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(newTagText); } }}
                  maxLength={30}
                />
                <button className="subtask-add-btn" onClick={() => addTag(newTagText)}><Plus size={18} /></button>
              </div>

              {/* Önerilen etiketler */}
              <div className="tag-suggestions">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Hızlı Ekle:</span>
                <div className="tag-chips-wrap">
                  {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(t => (
                    <button key={t} className="tag-suggest-btn" onClick={() => addTag(t)} style={{ '--tag-color': getTagColor(t) }}>
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Önizleme */}
          {viewMode === 'preview' && (
            <div className="markdown-preview">
              {noteContent
                ? <ReactMarkdown>{noteContent}</ReactMarkdown>
                : <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>Henüz not eklenmedi.</p>
              }
            </div>
          )}

          {/* Aktivite */}
          {viewMode === 'history' && (
            <div className="activity-container">
              <div className="task-meta-info">
                <div className="meta-item">
                  <span className="meta-label"><Calendar size={12} /> Oluşturulma</span>
                  <span className="meta-value">{formatDate(task.createdAt)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label"><CheckCircle2 size={12} /> Tamamlanma</span>
                  <span className="meta-value">{task.completedAt ? formatDate(task.completedAt) : 'Devam Ediyor'}</span>
                </div>
              </div>
              <div className="activity-timeline">
                {task.history && task.history.length > 0 ? (
                  [...task.history].reverse().map((entry, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-icon">{getActivityIcon(entry.action)}</div>
                      <div className="activity-content">
                        <span className="activity-action">{entry.action}</span>
                        <span className="activity-time">{formatDate(entry.timestamp)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Aktivite geçmişi bulunmuyor.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="note-modal-footer">
          <button className="button" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSave}>
            <Check size={18} /> Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaskNoteModal;
