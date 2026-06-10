import React, { useState } from 'react';
import { PlusCircle, ArrowLeft, Activity, Trash2, Archive, ArchiveRestore, FileText, Eye, Edit3, Share2, Download, Wand2, Sparkles } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import WeeklyPlan from '../components/WeeklyPlan';
import ReactMarkdown from 'react-markdown';
import * as api from '../api';

const ProjectDetails = ({ projects, addTask, toggleTask, deleteProject, deleteTask, updateTaskNote, updateTaskPriority, updateTaskSubtasks, updateTaskTags, updateTaskDueDate, updateTaskRecurrence, updateProjectNotes, reorderTasks, archiveProject, resetData, requestNotificationPermission, setIsSidebarCollapsed, isSidebarCollapsed, onLogout, toggleSettings, username, userId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id?.toString() === id?.toString());
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskWeek, setNewTaskWeek] = useState(1);
  const [newTaskDependsOn, setNewTaskDependsOn] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Orta');

  // Proje Notları state
  const [notesDraft, setNotesDraft] = useState('');
  const [notesView, setNotesView] = useState('edit'); // 'edit' | 'preview'
  const [notesOpen, setNotesOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [aiMessage, setAiMessage] = useState(null); // { type: 'success'|'error', text }

  const showMsg = (type, text) => {
    setAiMessage({ type, text });
    setTimeout(() => setAiMessage(null), 4000);
  };

  // Projeyi bulduktan sonra notesDraft'ı ayarla
  React.useEffect(() => {
    if (project) setNotesDraft(project.projectNotes || '');
  }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!project) {
    return (
      <div className="auth-layout">
        <Sidebar resetData={resetData} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} onLogout={onLogout} toggleSettings={toggleSettings} />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--text-primary)' }}>Proje Bulunamadı</h1>
            <Link to="/" className="button" style={{ marginTop: '2rem' }}>Dashboard'a Dön</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(id, newTaskText, parseInt(newTaskWeek), newTaskDependsOn ? parseInt(newTaskDependsOn) : null, newTaskPriority);
      setNewTaskText('');
      setNewTaskDependsOn('');
      setNewTaskPriority('Orta');
    }
  };

  const handleGetAISuggestions = async () => {
    setIsAILoading(true);
    try {
      const res = await api.getAISuggestions(id);
      if (res.suggestions && res.suggestions.length > 0) {
        for (const sugg of res.suggestions) {
          await addTask(id, sugg, 1, null, 'Orta');
        }
        showMsg('success', res.suggestions.length + ' AI görevi projeye eklendi!');
      } else {
        showMsg('error', 'Yeni öneri bulunamadı.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'AI önerileri alınamadı. Sunucu bağlantınızı kontrol edin.';
      showMsg('error', errorMsg);
    } finally {
      setIsAILoading(false);
    }
  };

  const handlePrioritize = async () => {
    setIsPrioritizing(true);
    try {
      const res = await api.prioritizeTasksByAI(id);
      if (res.orderedTitles && res.orderedTitles.length > 0) {
        // Mevcut gorevleri AI sirasina gore yeniden sirala
        const pendingTasks = project.tasks.filter(t => !t.completed);
        const doneTasks = project.tasks.filter(t => t.completed);
        const reordered = [];
        res.orderedTitles.forEach(title => {
          const match = pendingTasks.find(t => (t.text || t.title)?.toLowerCase().includes(title.toLowerCase()));
          if (match && !reordered.find(r => r.id === match.id)) reordered.push(match);
        });
        // Eslesmeyen gorevleri sona ekle
        pendingTasks.forEach(t => { if (!reordered.find(r => r.id === t.id)) reordered.push(t); });
        reorderTasks(id, [...reordered, ...doneTasks]);
        showMsg('success', 'Görevler AI tarafından öncelik sırasına göre yeniden düzenlendi!');
      } else {
        showMsg('error', 'AI sıralama yapamadı.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Sıralama başarısız.';
      showMsg('error', errorMsg);
    } finally {
      setIsPrioritizing(false);
    }
  };

  const handleSaveNotes = () => {
    if (updateProjectNotes) updateProjectNotes(id, notesDraft);
  };

  const handleShareProject = async () => {
    const username = window.prompt("Projeyi paylaşmak istediğiniz kullanıcının adını girin:");
    if (username && username.trim()) {
      try {
        await api.shareProjectAPI(id, username.trim());
        showMsg('success', username + ' kullanıcısı projeye eklendi!');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          showMsg('error', 'Kullanıcı bulunamadı.');
        } else {
          showMsg('error', 'Proje paylaşılırken bir hata oluştu.');
        }
      }
    }
  };

  const handleExportCSV = () => {
    if (!project || project.tasks.length === 0) {
      alert("Dışa aktarılacak görev bulunamadı.");
      return;
    }
    const headers = ["Görev Adı", "Hafta", "Öncelik", "Durum"];
    const rows = project.tasks.map(t => [
      `"${t.text.replace(/"/g, '""')}"`,
      t.week,
      t.priority || "Orta",
      t.completed ? "Tamamlandı" : "Bekliyor"
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${project.title.replace(/\s+/g, '_')}_Gorevler.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completedCount = project.tasks.filter(t => t.completed).length;
  const totalCount = project.tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const getStatusColor = (prog) => {
    if (prog === 100) return 'var(--status-done)';
    if (prog > 70)  return 'var(--status-high)';
    if (prog > 30)  return 'var(--status-mid)';
    return 'var(--status-low)';
  };

  const statusColor = project.color || getStatusColor(progress);
  const hasNotes = (project.projectNotes || '').trim().length > 0;

  return (
    <div className="auth-layout">
      <Sidebar resetData={resetData} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} onLogout={onLogout} toggleSettings={toggleSettings} />

      <main className="main-content">
        {/* AI Mesaj Bandi */}
        {aiMessage && (
          <div style={{
            marginBottom: '1rem',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 500,
            background: aiMessage.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: aiMessage.type === 'success' ? 'var(--accent)' : 'var(--danger)',
            border: `1px solid ${aiMessage.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {aiMessage.text}
          </div>
        )}
        <header className="animate-slide-up" style={{ marginBottom: '3rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Dashboard'a Dön
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{project.title}</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{project.description}</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                {project.priority && (
                  <span style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: project.priority === 'Yüksek' ? 'var(--danger)' : project.priority === 'Orta' ? 'var(--status-low)' : 'var(--status-mid)', border: '1px solid currentColor' }}>
                    🔥 {project.priority} Öncelik
                  </span>
                )}
                {project.deadline && (
                  <span style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    📅 Teslim: {project.deadline}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="status-badge" style={{ color: statusColor, padding: '8px 16px', fontSize: '0.8rem', marginTop: '8px' }}>
                {project.status ? project.status.toUpperCase() : (progress === 100 ? 'TAMAMLANDI' : 'DEVAM EDİYOR')}
              </span>
              <button
                onClick={handleGetAISuggestions}
                disabled={isAILoading}
                style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '6px 12px', borderRadius: '8px', color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.3s', marginTop: '8px' }}
                title="AI Görev Önerisi Al"
              >
                {isAILoading ? '...' : <><Wand2 size={16} /> AI Önerileri</>}
              </button>
              <button
                onClick={handlePrioritize}
                disabled={isPrioritizing}
                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '8px', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.3s', marginTop: '8px', opacity: isPrioritizing ? 0.7 : 1 }}
                title="AI ile Görevleri Öncelik Sırasına Dizle"
              >
                {isPrioritizing ? '...' : <><Sparkles size={16} /> AI ile Sirala</>}
              </button>
              <button
                onClick={handleExportCSV}
                style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '6px 12px', borderRadius: '8px', color: '#eab308', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.3s', marginTop: '8px' }}
                title="CSV Olarak İndir"
              >
                <Download size={16} /> CSV İndir
              </button>
              <button
                onClick={handleShareProject}
                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '8px', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.3s', marginTop: '8px' }}
                title="Projeyi Paylaş"
              >
                <Share2 size={16} /> Paylaş
              </button>
              <button
                onClick={() => archiveProject(project.id)}
                style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.3s', marginTop: '8px' }}
                title={project.archived ? "Arşivden Çıkar" : "Arşivle"}
              >
                {project.archived ? <><ArchiveRestore size={16} />Geri Yükle</> : <><Archive size={16} />Arşivle</>}
              </button>
              <button
                onClick={() => { deleteProject(project.id); navigate('/'); }}
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '8px', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.3s', marginTop: '8px' }}
              >
                <Trash2 size={16} /> Sil
              </button>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Genel İlerleme</span>
              <span style={{ color: statusColor, fontWeight: 'bold' }}>%{progress}</span>
            </div>
            <div className="progress-bar" style={{ height: '14px', borderRadius: '7px' }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: statusColor }}></div>
            </div>
          </div>
        </header>

        <section className="animate-slide-up delay-100" style={{ maxWidth: '900px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="var(--primary)" />
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>Görev Dağılımı</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <WeeklyPlan
              project={project}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              updateTaskNote={updateTaskNote}
              updateTaskPriority={updateTaskPriority}
              updateTaskSubtasks={updateTaskSubtasks}
              updateTaskTags={updateTaskTags}
              updateTaskDueDate={updateTaskDueDate}
              updateTaskRecurrence={updateTaskRecurrence}
              reorderTasks={reorderTasks}
              currentUsername={username}
              currentUserId={userId}
            />
          </div>

          {/* ── Yeni Görev Ekle ── */}
          <form className="card" onSubmit={handleAddTask} style={{ marginTop: '3rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1rem' }}>Yeni Görev Planla</h4>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Görev adı..."
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                className="glass-input"
                style={{ flex: 2 }}
              />
              <div style={{ flex: 0.6, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', pointerEvents: 'none', fontWeight: 600, zIndex: 1 }}>Hafta</span>
                <input
                  type="number"
                  min="1"
                  placeholder="No"
                  value={newTaskWeek}
                  onChange={e => setNewTaskWeek(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '55px' }}
                  title="Hangi haftaya ekleneceğini belirleyin"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select value={newTaskDependsOn} onChange={e => setNewTaskDependsOn(e.target.value)} className="glass-input" style={{ flex: 1 }}>
                <option value="">Bağımlılık Yok</option>
                {project.tasks.map(t => <option key={t.id} value={t.id}>Bağımlı: {t.text}</option>)}
              </select>
              <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)} className="glass-input" style={{ flex: 0.6 }}>
                <option value="Yüksek">🔴 Yüksek</option>
                <option value="Orta">🟡 Orta</option>
                <option value="Düşük">🟢 Düşük</option>
              </select>
              <button type="submit" className="button" style={{ padding: '12px 24px' }}>
                <PlusCircle size={20} /> Ekle
              </button>
            </div>
          </form>

          {/* ── Proje Notları ── */}
          <div className="project-notes-panel" style={{ marginTop: '2rem' }}>
            <button
              className="project-notes-toggle"
              onClick={() => setNotesOpen(o => !o)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} color="var(--primary)" />
                <span>Proje Notları</span>
                {hasNotes && <span className="notes-has-badge">●</span>}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {notesOpen ? '▲ Kapat' : '▼ Aç'}
              </span>
            </button>

            {notesOpen && (
              <div className="project-notes-body animate-slide-up">
                {/* Sekme */}
                <div className="note-tabs" style={{ borderRadius: 0 }}>
                  <button className={`note-tab ${notesView === 'edit' ? 'active' : ''}`} onClick={() => setNotesView('edit')}>
                    <Edit3 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Düzenle
                  </button>
                  <button className={`note-tab ${notesView === 'preview' ? 'active' : ''}`} onClick={() => setNotesView('preview')}>
                    <Eye size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Önizleme
                  </button>
                </div>

                {notesView === 'edit' ? (
                  <textarea
                    className="project-notes-textarea"
                    placeholder="Proje hakkında notlar, toplantı kararları, referans linkler... (Markdown desteklenir)"
                    value={notesDraft}
                    onChange={e => setNotesDraft(e.target.value)}
                  />
                ) : (
                  <div className="markdown-preview project-notes-preview">
                    {notesDraft.trim()
                      ? <ReactMarkdown>{notesDraft}</ReactMarkdown>
                      : <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>Henüz not girilmedi.</p>
                    }
                  </div>
                )}

                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                  <button
                    className="button"
                    style={{ padding: '10px 24px' }}
                    onClick={handleSaveNotes}
                  >
                    <FileText size={16} /> Notları Kaydet
                  </button>
                  <button
                    className="button button-secondary"
                    style={{ padding: '10px 24px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)' }}
                    onClick={async () => {
                      if (!notesDraft.trim()) return;
                      try {
                        const res = await api.summarizeNotesByAI(notesDraft);
                        if (res.summary) setNotesDraft(res.summary);
                      } catch(err) {
                        alert('Özetleme başarısız. AI limitlerine takılmış olabilirsiniz.');
                      }
                    }}
                    title="Notları AI ile Özetle"
                  >
                    <Wand2 size={16} /> AI ile Özetle
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectDetails;
