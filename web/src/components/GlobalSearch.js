import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Tag, CheckCircle2, Circle, Calendar } from 'lucide-react';

const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981', Yuksek: '#ef4444', Orta: '#f59e0b', Dusuk: '#10b981' };

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(99,102,241,0.3)', color: 'var(--primary)', borderRadius: '2px', padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function getDueDateLabel(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date(); today.setHours(0,0,0,0);
  const dueDay = new Date(due); dueDay.setHours(0,0,0,0);
  const diff = Math.round((dueDay - today) / 86400000);
  if (diff < 0) return { label: Math.abs(diff) + 'g geçti', color: 'var(--danger)' };
  if (diff === 0) return { label: 'Bugün', color: '#f59e0b' };
  if (diff === 1) return { label: 'Yarın', color: '#f59e0b' };
  return { label: due.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }), color: 'var(--text-secondary)' };
}

export default function GlobalSearch({ projects }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const results = React.useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const hits = [];

    projects.filter(p => !p.archived).forEach(project => {
      project.tasks.forEach(task => {
        const titleMatch  = task.text?.toLowerCase().includes(q) || task.title?.toLowerCase().includes(q);
        const notesMatch  = task.notes?.toLowerCase().includes(q);
        const tagsMatch   = task.tags?.some(t => t.toLowerCase().includes(q));
        if (titleMatch || notesMatch || tagsMatch) {
          hits.push({
            id: task.id || task._id,
            text: task.text || task.title,
            notes: task.notes,
            tags: task.tags || [],
            completed: task.completed,
            priority: task.priority,
            dueDate: task.dueDate,
            projectId: project.id,
            projectTitle: project.title,
            projectColor: project.color || '#6366f1',
            matchType: titleMatch ? 'title' : notesMatch ? 'notes' : 'tag',
          });
        }
      });
    });

    return hits.slice(0, 12);
  }, [query, projects]);

  useEffect(() => { setActiveIdx(-1); }, [results]);

  const go = useCallback((hit) => {
    navigate('/project/' + hit.projectId);
    setQuery('');
    setOpen(false);
  }, [navigate]);

  const handleKey = (e) => {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) go(results[activeIdx]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '340px' }}>
      {/* Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '8px 14px', transition: 'border-color 0.2s', ...(open ? { borderColor: 'var(--primary)' } : {}) }}>
        <Search size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Görev, etiket veya not ara... (Ctrl+K)"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}>
            <X size={15} />
          </button>
        )}
        <kbd style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '1px 5px', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>Ctrl K</kbd>
      </div>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 999, overflow: 'hidden', maxHeight: '440px', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Sonuç bulunamadı
            </div>
          ) : (
            <>
              <div style={{ padding: '8px 14px 6px', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {results.length} sonuç
              </div>
              {results.map((hit, idx) => {
                const due = getDueDateLabel(hit.dueDate);
                return (
                  <div
                    key={hit.id + idx}
                    onClick={() => go(hit)}
                    style={{ padding: '10px 14px', cursor: 'pointer', background: idx === activeIdx ? 'rgba(99,102,241,0.1)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                    onMouseEnter={() => setActiveIdx(idx)}
                  >
                    {/* Project chip */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hit.projectColor, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{hit.projectTitle}</span>
                      {hit.matchType === 'notes' && <FileText size={11} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />}
                      {hit.matchType === 'tag' && <Tag size={11} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />}
                    </div>

                    {/* Task title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hit.completed
                        ? <CheckCircle2 size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                        : <Circle size={15} color="var(--text-secondary)" style={{ flexShrink: 0 }} />}
                      <span style={{ fontSize: '0.88rem', color: hit.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: hit.completed ? 'line-through' : 'none', fontWeight: 500 }}>
                        {highlight(hit.text, query)}
                      </span>
                      {hit.priority && (
                        <span style={{ fontSize: '0.68rem', color: PRIORITY_COLOR[hit.priority] || 'var(--text-secondary)', fontWeight: 700, marginLeft: 'auto', flexShrink: 0 }}>
                          {hit.priority === 'high' ? 'Y' : hit.priority === 'medium' ? 'O' : 'D'}
                        </span>
                      )}
                    </div>

                    {/* Notes snippet */}
                    {hit.matchType === 'notes' && hit.notes && (
                      <p style={{ margin: '4px 0 0 23px', fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {highlight(hit.notes, query)}
                      </p>
                    )}

                    {/* Tags + due */}
                    {(hit.tags.length > 0 || due) && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '5px', marginLeft: '23px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {hit.tags.slice(0,3).map(tag => (
                          <span key={tag} style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)' }}>
                            {highlight(tag, query)}
                          </span>
                        ))}
                        {due && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: due.color, marginLeft: 'auto' }}>
                            <Calendar size={10} /> {due.label}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
