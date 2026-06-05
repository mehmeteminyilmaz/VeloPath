import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Check, Clock, Calendar, History, Edit3, CheckCircle2, RotateCcw, ArrowRight, PlusCircle, ListChecks, Trash2, Plus, Tag, Wand2, FileText, MessageSquare, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as api from '../api';

const PRIORITY_OPTIONS = [
  { value: 'Yuksek', label: 'Yuksek', color: 'var(--danger)' },
  { value: 'Orta',   label: 'Orta',   color: 'var(--status-low)' },
  { value: 'Dusuk',  label: 'Dusuk',  color: 'var(--status-high)' },
];

const SUGGESTED_TAGS = ['React', 'Backend', 'Tasarim', 'Test', 'API', 'UI', 'Dokumantasyon', 'Bug', 'Ozellik', 'Acil'];
const TAG_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#3b82f6','#06b6d4','#84cc16','#f97316'];

function getTagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

const RECURRENCE_OPTIONS = [
  { value: 'none',    label: 'Tekrar Yok' },
  { value: 'daily',   label: 'Her Gun' },
  { value: 'weekly',  label: 'Her Hafta' },
  { value: 'monthly', label: 'Her Ay' },
];

const TaskNoteModal = ({ task, projectId, onClose, onSave, onPriorityChange, onSubtasksChange, onTagsChange, onDueDateChange, onRecurrenceChange, currentUsername, currentUserId }) => {
  const [noteContent, setNoteContent] = useState(task.notes || '');
  const [viewMode, setViewMode] = useState('edit');
  const [priority, setPriority] = useState(task.priority || 'Orta');
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [tags, setTags] = useState(task.tags || []);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [recurrenceType, setRecurrenceType] = useState(task.recurrence?.type || 'none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(task.recurrence?.interval || 1);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newTagText, setNewTagText] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);
  const [comments, setComments] = useState(task.comments || []);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const showMsg = (type, text) => {
    setAiMessage({ type, text });
    setTimeout(() => setAiMessage(null), 4000);
  };

  const handleSave = () => {
    if (dueDate) {
      const year = new Date(dueDate).getFullYear();
      if (year < 2020 || year > 2100 || isNaN(year)) {
        alert('Lütfen geçerli bir bitiş tarihi seçin (Yıl 2020 ile 2100 arasında olmalıdır).');
        return;
      }
    }

    onSave(task.id, noteContent);
    if (onPriorityChange && priority !== task.priority) onPriorityChange(task.id, priority);
    if (onSubtasksChange) onSubtasksChange(task.id, subtasks);
    if (onTagsChange) onTagsChange(task.id, tags);
    if (onDueDateChange) onDueDateChange(task.id, dueDate || null);
    if (onRecurrenceChange) {
      const rec = recurrenceType !== 'none' ? { type: recurrenceType, interval: Number(recurrenceInterval) || 1 } : null;
      onRecurrenceChange(task.id, rec);
    }
    onClose();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const comment = await api.addCommentAPI(task.id || task._id, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      showMsg('error', 'Yorum eklenemedi.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteCommentAPI(task.id || task._id, commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      showMsg('error', 'Yorum silinemedi.');
    }
  };

  const addSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks(prev => [...prev, { id: Date.now(), text: newSubtaskText.trim(), completed: false }]);
    setNewSubtaskText('');
  };
  const toggleSubtask = (id) => setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  const deleteSubtask = (id) => setSubtasks(prev => prev.filter(s => s.id !== id));

  const handleAIBreakdown = async () => {
    setIsAILoading(true);
    try {
      const res = await api.breakTaskByAI(task.text);
      if (res.subtasks && res.subtasks.length > 0) {
        setSubtasks(prev => [...prev, ...res.subtasks.map((text, i) => ({ id: Date.now() + i, text, completed: false }))]);
        showMsg('success', res.subtasks.length + ' alt gorev eklendi.');
      } else {
        showMsg('error', 'Alt gorev olusturulamadi.');
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) showMsg('error', 'AI kotasi doldu. 1 dakika bekleyin.');
      else showMsg('error', 'Alt gorevler olusturulamadi.');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!noteContent.trim()) { showMsg('error', 'Ozetlenecek not yok.'); return; }
    setIsSummarizing(true);
    try {
      const res = await api.summarizeNotesByAI(noteContent);
      if (res.summary) {
        setNoteContent(res.summary);
        showMsg('success', 'Not AI ile ozetlendi.');
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) showMsg('error', 'AI kotasi doldu. 1 dakika bekleyin.');
      else showMsg('error', 'Ozetleme basarisiz.');
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

  const getActivityIcon = (action) => {
    if (action.includes('olusturdu'))  return <PlusCircle size={14} />;
    if (action.includes('tamamlandi')) return <CheckCircle2 size={14} color="var(--accent)" />;
    if (action.includes('aktif'))      return <RotateCcw size={14} color="var(--status-low)" />;
    if (action.includes('notunu'))     return <Edit3 size={14} />;
    if (action.includes('tasidi'))     return <ArrowRight size={14} />;
    if (action.includes('onceligi'))   return <span style={{ fontSize: 12 }}>z</span>;
    if (action.includes('alt'))        return <ListChecks size={14} />;
    if (action.includes('etiket'))     return <Tag size={14} />;
    return <Clock size={14} />;
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="note-modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>

        {/* Header */}
        <div className="note-modal-header">
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>Gorev Detaylari</h3>
            <p style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '10px' }}>{task.text}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Oncelik:</span>
              <div className="task-priority-selector">
                {PRIORITY_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setPriority(opt.value)}
                    className={`priority-chip ${priority === opt.value ? 'active' : ''}`}
                    style={{ '--chip-color': opt.color }}>{opt.label}</button>
                ))}
              </div>
            </div>
            {/* Due Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <Calendar size={13} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Bitis Tarihi:</span>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: 'var(--text-primary)', padding: '3px 8px', fontSize: '0.8rem', cursor: 'pointer' }}
              />
              {dueDate && (
                <button onClick={() => setDueDate('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.75rem' }}>
                  <X size={12} /> Kaldir
                </button>
              )}
            </div>
            {/* Tekrarlama */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <Clock size={13} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Tekrar:</span>
              <select
                value={recurrenceType}
                onChange={e => setRecurrenceType(e.target.value)}
                style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: 'var(--text-primary)', padding: '3px 8px', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                {RECURRENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {recurrenceType !== 'none' && (
                <>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>her</span>
                  <input
                    type="number" min="1" max="30"
                    value={recurrenceInterval}
                    onChange={e => setRecurrenceInterval(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: '52px', background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: 'var(--text-primary)', padding: '3px 8px', fontSize: '0.8rem', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {recurrenceType === 'daily' ? 'gunde' : recurrenceType === 'weekly' ? 'haftada' : 'ayda'}
                  </span>
                </>
              )}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* AI Mesaj Bandi */}
        {aiMessage && (
          <div style={{
            margin: '0 0 8px',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            background: aiMessage.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: aiMessage.type === 'success' ? 'var(--accent)' : 'var(--danger)',
            border: `1px solid ${aiMessage.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {aiMessage.text}
          </div>
        )}

        {/* Tabs */}
        <div className="note-tabs">
          {[
            { key: 'edit',     icon: <Edit3 size={15} />,      label: 'Not' },
            { key: 'subtasks', icon: <ListChecks size={15} />,  label: 'Alt Gorevler', badge: subtasks.length > 0 ? completedSubs + '/' + subtasks.length : null },
            { key: 'tags',     icon: <Tag size={15} />,         label: 'Etiketler',    badge: tags.length > 0 ? tags.length : null },
            { key: 'comments', icon: <MessageSquare size={15} />, label: 'Yorumlar', badge: comments.length > 0 ? comments.length : null },
            { key: 'preview',  icon: <Check size={15} />,       label: 'Onizleme' },
            { key: 'history',  icon: <History size={15} />,     label: 'Aktivite' },
          ].map(tab => (
            <button key={tab.key} className={`note-tab ${viewMode === tab.key ? 'active' : ''}`} onClick={() => setViewMode(tab.key)}>
              <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>{tab.icon}</span>
              {tab.label}
              {tab.badge != null && <span className="subtask-tab-badge">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="note-body" style={{ minHeight: 260 }}>

          {/* Not Duzenle */}
          {viewMode === 'edit' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
              <textarea className="note-textarea"
                placeholder="Markdown formatinda notlarinizi yazin... (Ornek: # Baslik, - Liste, **Kalin**)"
                value={noteContent} onChange={e => setNoteContent(e.target.value)} autoFocus
                style={{ flex: 1 }}
              />
              <button
                onClick={handleSummarize}
                disabled={isSummarizing || !noteContent.trim()}
                style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', background: 'rgba(168,85,247,0.1)', color: '#a855f7', fontWeight: 600, opacity: (!noteContent.trim() || isSummarizing) ? 0.5 : 1 }}
              >
                <FileText size={14} />
                {isSummarizing ? 'Ozetleniyor...' : 'AI ile Ozetle'}
              </button>
            </div>
          )}

          {/* Alt Gorevler */}
          {viewMode === 'subtasks' && (
            <div className="subtasks-container">
              {subtasks.length > 0 && (
                <div className="subtask-progress-area">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{completedSubs} / {subtasks.length} tamamlandi</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: subProgress === 100 ? 'var(--accent)' : 'var(--primary)' }}>%{subProgress}</span>
                  </div>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: subProgress + '%', background: subProgress === 100 ? 'var(--accent)' : 'var(--primary)' }} />
                  </div>
                </div>
              )}
              <div className="subtask-list">
                {subtasks.length === 0 ? (
                  <div className="subtask-empty">
                    <ListChecks size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                    <p>Henuz alt gorev yok.</p>
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
                <input type="text" className="note-textarea"
                  style={{ resize: 'none', height: 'auto', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }}
                  placeholder="Yeni alt gorev ekle... (Enter)"
                  value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                />
                <button className="subtask-add-btn" onClick={addSubtask} title="Ekle"><Plus size={18} /></button>
                <button className="subtask-add-btn"
                  style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}
                  onClick={handleAIBreakdown} disabled={isAILoading}
                  title="Yapay Zeka ile Alt Gorevlere Bol">
                  {isAILoading ? '...' : <Wand2 size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Etiketler */}
          {viewMode === 'tags' && (
            <div className="tags-panel">
              <div className="tags-current">
                {tags.length === 0 ? (
                  <div className="subtask-empty"><Tag size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} /><p>Henuz etiket eklenmedi.</p></div>
                ) : (
                  <div className="tag-chips-wrap">
                    {tags.map(tag => (
                      <span key={tag} className="tag-chip" style={{ '--tag-color': getTagColor(tag) }}>
                        {tag}
                        <button className="tag-remove-btn" onClick={() => removeTag(tag)} title="Kaldir"><X size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="tag-add-row">
                <input type="text" className="note-textarea"
                  style={{ resize: 'none', height: 'auto', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }}
                  placeholder="Yeni etiket yaz... (Enter)"
                  value={newTagText} onChange={e => setNewTagText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(newTagText); } }}
                  maxLength={30}
                />
                <button className="subtask-add-btn" onClick={() => addTag(newTagText)}><Plus size={18} /></button>
              </div>
              <div className="tag-suggestions">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Hizli Ekle:</span>
                <div className="tag-chips-wrap">
                  {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(t => (
                    <button key={t} className="tag-suggest-btn" onClick={() => addTag(t)} style={{ '--tag-color': getTagColor(t) }}>+ {t}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Yorumlar */}
          {viewMode === 'comments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>Henuz yorum yok.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {comments.map(c => (
                    <div key={c._id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)' }}>{c.username}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {c.createdAt ? new Date(c.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          {(c.username === currentUsername) && (
                            <button onClick={() => handleDeleteComment(c._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }} title="Sil">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* Yeni yorum */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder="Yorum yaz... (Enter)"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                  style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--text-primary)', padding: '10px 14px', fontSize: '0.88rem', outline: 'none' }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading || !newComment.trim()}
                  style={{ background: 'rgba(99,102,241,0.15)', border: 'none', borderRadius: '10px', color: 'var(--primary)', cursor: 'pointer', padding: '0 14px', display: 'flex', alignItems: 'center', opacity: (!newComment.trim() || commentLoading) ? 0.5 : 1 }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Onizleme */}
          {viewMode === 'preview' && (
            <div className="markdown-preview">
              {noteContent ? <ReactMarkdown>{noteContent}</ReactMarkdown>
                : <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>Henuz not eklenmedi.</p>}
            </div>
          )}

          {/* Aktivite */}
          {viewMode === 'history' && (
            <div className="activity-container">
              <div className="task-meta-info">
                <div className="meta-item">
                  <span className="meta-label"><Calendar size={12} /> Olusturulma</span>
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
                ) : <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Aktivite gecmisi bulunmuyor.</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
