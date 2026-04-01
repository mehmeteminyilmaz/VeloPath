import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Check, Clock, Calendar, History, Edit3, CheckCircle2, RotateCcw, ArrowRight, PlusCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const TaskNoteModal = ({ task, onClose, onSave }) => {
  const [noteContent, setNoteContent] = useState(task.notes || '');
  const [viewMode, setViewMode] = useState('edit');

  const handleSave = () => {
    onSave(task.id, noteContent);
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (action) => {
    if (action.includes('oluşturdu')) return <PlusCircle size={14} />;
    if (action.includes('tamamlandı')) return <CheckCircle2 size={14} color="var(--accent)" />;
    if (action.includes('aktif')) return <RotateCcw size={14} color="var(--status-low)" />;
    if (action.includes('notunu')) return <Edit3 size={14} />;
    if (action.includes('taşıdı')) return <ArrowRight size={14} />;
    return <Clock size={14} />;
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="note-modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="note-modal-header">
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Görev Detayları</h3>
            <p style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 500 }}>{task.text}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="note-tabs">
          <button 
            className={`note-tab ${viewMode === 'edit' ? 'active' : ''}`}
            onClick={() => setViewMode('edit')}
          >
            <Edit3 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Düzenle
          </button>
          <button 
            className={`note-tab ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            <Check size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Önizleme
          </button>
          <button 
            className={`note-tab ${viewMode === 'history' ? 'active' : ''}`}
            onClick={() => setViewMode('history')}
          >
            <History size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Aktivite
          </button>
        </div>

        <div className="note-body">
          {viewMode === 'edit' ? (
            <textarea
              className="note-textarea"
              placeholder="Markdown formatında notlarınızı yazın... (Örn: # Başlık, - Liste, **Kalın**)"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              autoFocus
            />
          ) : viewMode === 'preview' ? (
            <div className="markdown-preview">
              {noteContent ? (
                <ReactMarkdown>{noteContent}</ReactMarkdown>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>Henüz not eklenmedi.</p>
              )}
            </div>
          ) : (
            <div className="activity-container">
              <div className="task-meta-info">
                <div className="meta-item">
                  <span className="meta-label"> <Calendar size={12} /> Oluşturulma</span>
                  <span className="meta-value">{formatDate(task.createdAt)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label"> <CheckCircle2 size={12} /> Tamamlanma</span>
                  <span className="meta-value">{task.completedAt ? formatDate(task.completedAt) : 'Devam Ediyor'}</span>
                </div>
              </div>

              <div className="activity-timeline">
                {task.history && task.history.length > 0 ? (
                  [...task.history].reverse().map((entry, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-icon">
                        {getActivityIcon(entry.action)}
                      </div>
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
