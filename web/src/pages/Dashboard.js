import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProgressChart from '../components/ProgressChart';
import Onboarding from '../components/Onboarding';
import EmptyState from '../components/EmptyState';
import {
  PlusCircle, Briefcase, CheckCircle, Activity, Layout,
  Trash2, Archive, ArchiveRestore, FolderOpen, Inbox,
  Search, X, LayoutGrid, Columns
} from 'lucide-react';

// ── Ortak Proje Kartı (Grid ve Kanban içinde paylaşılır) ──
const ProjectCard = ({ project, navigate, archiveProject, deleteProject, getProgressInfo }) => {
  const completedTasks = project.tasks.filter(t => t.completed).length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const info = getProgressInfo(progress);

  return (
    <div
      onClick={e => { if (e.target.closest('button')) return; navigate(`/project/${project.id}`); }}
      className={`card ${info.glow ? 'glow-card' : ''}`}
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      <div className="project-color-stripe" style={{ backgroundColor: project.color || '#6366f1' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.3 }}>{project.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <span className="status-badge" style={{ color: info.color }}>{project.status || info.label}</span>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); archiveProject(project.id); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '6px', transition: '0.2s' }}
            title={project.archived ? 'Arşivden Çıkar' : 'Arşivle'}
            onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            {project.archived ? <ArchiveRestore size={17} style={{ pointerEvents: 'none' }} /> : <Archive size={17} style={{ pointerEvents: 'none' }} />}
          </button>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); deleteProject(project.id); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '6px', transition: '0.2s' }}
            title="Projeyi Sil"
            onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Trash2 size={17} style={{ pointerEvents: 'none' }} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {project.priority && (
          <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: project.priority === 'Yüksek' ? 'var(--danger)' : project.priority === 'Orta' ? 'var(--status-low)' : 'var(--status-mid)' }}>
            {project.priority} Öncelik
          </span>
        )}
        {project.deadline && (
          <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            Son: {project.deadline}
          </span>
        )}
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.2rem' }}>
        {completedTasks} / {totalTasks} Görev Tamamlandı
      </p>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%`, background: project.color || info.color }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
        <p style={{ fontSize: '0.75rem', color: project.color || info.color, fontWeight: 'bold' }}>%{progress}</p>
      </div>
    </div>
  );
};

// ── Kanban Sütun Başlıkları ──
const KANBAN_COLS = [
  { key: 'todo',    label: 'Yapılacak',     color: '#f59e0b', icon: '📋' },
  { key: 'doing',   label: 'Devam Ediyor',  color: '#3b82f6', icon: '⚡' },
  { key: 'done',    label: 'Tamamlandı',    color: '#10b981', icon: '✅' },
];

function getKanbanCol(project) {
  const completed = project.tasks.filter(t => t.completed).length;
  const total = project.tasks.length;
  if (total === 0 || completed === 0) return 'todo';
  if (completed === total) return 'done';
  return 'doing';
}

// ── Dashboard ──
const Dashboard = ({ projects, deleteProject, archiveProject, resetData, sendTaskNotification, requestNotificationPermission, setIsSidebarCollapsed, isSidebarCollapsed, username, onLogout }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode]         = useState('active');   // 'active' | 'archived'
  const [layoutMode, setLayoutMode]     = useState('grid');     // 'grid' | 'kanban'
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem('onboardingDone') !== 'true');

  const handleOnboardingComplete = () => { localStorage.setItem('onboardingDone', 'true'); setShowOnboarding(false); };

  const stats = {
    total:            projects.length,
    activeProjects:   projects.filter(p => !p.archived).length,
    archivedProjects: projects.filter(p => p.archived).length,
    activeTasks:      projects.reduce((acc, p) => acc + p.tasks.filter(t => !t.completed).length, 0),
    completed:        projects.filter(p => p.tasks.length > 0 && p.tasks.every(t => t.completed)).length,
  };

  const filteredProjects = projects.filter(p => {
    const matchesViewMode = searchTerm ? true : (viewMode === 'active' ? !p.archived : p.archived);
    const matchesSearch   = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = filterPriority === 'All' || p.priority === filterPriority;
    return matchesViewMode && matchesSearch && matchesPriority;
  });

  const calculateGlobalProgress = () => {
    if (projects.length === 0) return 0;
    const total = projects.reduce((acc, p) => {
      const c = p.tasks.filter(t => t.completed).length;
      return acc + (p.tasks.length === 0 ? 0 : (c / p.tasks.length) * 100);
    }, 0);
    return Math.round(total / projects.length);
  };

  const globalProgress = calculateGlobalProgress();

  const getProgressInfo = (progress) => {
    if (progress === 100) return { color: 'var(--status-done)', label: 'Tamamlandı', glow: true };
    if (progress > 70)   return { color: 'var(--status-high)', label: 'Final Yakın', glow: false };
    if (progress > 30)   return { color: 'var(--status-mid)',  label: 'İlerliyor',   glow: false };
    return                      { color: 'var(--status-low)',  label: 'Başlangıç',   glow: false };
  };

  const cardProps = { navigate, archiveProject, deleteProject, getProgressInfo };

  return (
    <div className="auth-layout">
      <Sidebar resetData={resetData} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} onLogout={onLogout} />

      <main className="main-content">
        {/* Header */}
        <header className="animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Kontrol Paneli</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Hoş Geldin, {username || 'Misafir'}! Bugün neler yapıyoruz?</p>
          </div>
          <Link to="/create" className="button">
            <PlusCircle size={20} /> Yeni Proje Oluştur
          </Link>
        </header>

        {/* İstatistik Kartları */}
        <section className="stats-container animate-slide-up delay-100">
          <div className="stat-card">
            <div className="stat-icon"><Briefcase size={24} /></div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{viewMode === 'active' ? 'Aktif Projeler' : 'Arşivlenmiş'}</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{viewMode === 'active' ? stats.activeProjects : stats.archivedProjects}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)' }}><Activity size={24} /></div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Bekleyen Görevler</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{stats.activeTasks}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--status-done)' }}><CheckCircle size={24} /></div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tamamlananlar</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{stats.completed}</h3>
            </div>
          </div>
          <div className="stat-card progress-card">
            <ProgressChart progress={globalProgress} />
          </div>
        </section>

        {/* Toolbar: Aktif/Arşiv + Grid/Kanban */}
        <div className="animate-slide-up delay-200" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Layout size={20} color="var(--primary)" />
            {viewMode === 'active' ? (layoutMode === 'kanban' ? 'Kanban Panosu' : 'Projelerim') : 'Proje Arşivi'}
          </h2>

          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Aktif / Arşiv */}
            <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {['active', 'archived'].map(mode => (
                <button key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{ padding: '6px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem',
                    background: viewMode === mode ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    color: viewMode === mode ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: viewMode === mode ? 600 : 400, transition: '0.3s' }}
                >
                  {mode === 'active' ? 'Aktif' : 'Arşiv'}
                </button>
              ))}
            </div>

            {/* Grid / Kanban (sadece aktif görünümde göster) */}
            {viewMode === 'active' && (
              <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => setLayoutMode('grid')}
                  title="Grid Görünüm"
                  style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    background: layoutMode === 'grid' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    color: layoutMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)', transition: '0.3s',
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: layoutMode === 'grid' ? 600 : 400 }}
                >
                  <LayoutGrid size={16} /> Grid
                </button>
                <button
                  onClick={() => setLayoutMode('kanban')}
                  title="Kanban Görünüm"
                  style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    background: layoutMode === 'kanban' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    color: layoutMode === 'kanban' ? 'var(--primary)' : 'var(--text-secondary)', transition: '0.3s',
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: layoutMode === 'kanban' ? 600 : 400 }}
                >
                  <Columns size={16} /> Kanban
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Arama & Filtre */}
        <div className="search-filter-bar animate-slide-up delay-200" style={{ marginBottom: '2rem' }}>
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Proje ara (başlık veya açıklama)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}><X size={16} /></button>
            )}
          </div>
          <div className="filter-pills">
            <span className="filter-label">Öncelik :</span>
            {['All', 'Yüksek', 'Orta', 'Düşük'].map(priority => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                className={`filter-pill ${filterPriority === priority ? 'active' : ''} priority-${priority.toLowerCase()}`}
              >
                {priority === 'All' ? 'Tümü' : priority}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid Görünüm ── */}
        {layoutMode === 'grid' || viewMode === 'archived' ? (
          <section className="grid animate-slide-up delay-300">
            {filteredProjects.length === 0 ? (
              <EmptyState
                icon={viewMode === 'active' ? FolderOpen : Inbox}
                title={viewMode === 'active' ? 'Henüz Aktif Projeniz Yok' : 'Arşivde Proje Bulunmuyor'}
                description={viewMode === 'active'
                  ? 'Hayallerinizi gerçekleştirmek için ilk adımınızı atın. Yeni bir proje oluşturarak planlamaya başlayın!'
                  : 'Arşivlediğiniz projeler burada görünecektir.'}
                actionLink={viewMode === 'active' ? '/create' : null}
                actionLabel={viewMode === 'active' ? 'İlk Projeni Oluştur' : null}
                actionIcon={PlusCircle}
              />
            ) : (
              filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} {...cardProps} />
              ))
            )}
          </section>
        ) : (
          /* ── Kanban Görünüm ── */
          <section className="kanban-board animate-slide-up delay-300">
            {KANBAN_COLS.map(col => {
              const colProjects = filteredProjects.filter(p => getKanbanCol(p) === col.key);
              return (
                <div key={col.key} className="kanban-column">
                  {/* Sütun başlığı */}
                  <div className="kanban-col-header" style={{ '--col-color': col.color }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{col.icon}</span>
                      <span className="kanban-col-title">{col.label}</span>
                      <span className="kanban-col-count">{colProjects.length}</span>
                    </div>
                    <div className="kanban-col-accent-bar" style={{ background: col.color }} />
                  </div>

                  {/* Kartlar */}
                  <div className="kanban-col-body">
                    {colProjects.length === 0 ? (
                      <div className="kanban-empty-col">
                        <p>Proje yok</p>
                      </div>
                    ) : (
                      colProjects.map(project => (
                        <ProjectCard key={project.id} project={project} {...cardProps} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
    </div>
  );
};

export default Dashboard;
