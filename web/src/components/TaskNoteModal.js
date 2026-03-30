import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const TaskNoteModal = ({ task, onClose, onSave }) => {
  const [noteContent, setNoteContent] = useState(task.notes || '');
  const [viewMode, setViewMode] = useState('edit');

  const handleSave = () => {
    onSave(task.id, noteContent);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="note-modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="note-modal-header">
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Görev Notları</h3>
            <p style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 500 }}>{task.text}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="note-tabs">
          <button 
            className={`note-tab ${viewMode === 'edit' ? 'active' : ''}`}
            onClick={() => setViewMode('edit')}
          >
            Düzenle
          </button>
          <button 
            className={`note-tab ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            Önizleme
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
          ) : (
            <div className="markdown-preview">
              {noteContent ? (
                <ReactMarkdown>{noteContent}</ReactMarkdown>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>Henüz not eklenmedi.</p>
              )}
            </div>
          )}
        </div>

        <div className="note-modal-footer">
          <button className="button" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSave}>
            <Check size={18} /> Kaydet
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaskNoteModal;
