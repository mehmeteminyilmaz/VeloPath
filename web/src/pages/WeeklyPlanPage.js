import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import TaskNoteModal from '../components/TaskNoteModal';
import { ChevronDown, ChevronRight, CheckCircle, Circle, Trash2, Calendar, FileText, Award, TrendingUp, Tag, Clock } from 'lucide-react';

const PRIORITY_COLOR = {
  'Yüksek': 'var(--danger)',
  'high': 'var(--danger)',
  'Orta': 'var(--status-low)',
  'medium': 'var(--status-low)',
  'Düşük': 'var(--status-high)',
  'low': 'var(--status-high)',
};
const PRIORITY_LABEL = {
  'Yüksek': '🔴',
  'high': '🔴',
  'Orta': '🟡',
  'medium': '🟡',
  'Düşük': '🟢',
  'low': '🟢',
};
const PRIORITY_TEXT = {
  'Yüksek': 'Yüksek',
  'high': 'Yüksek',
  'Orta': 'Orta',
  'medium': 'Orta',
  'Düşük': 'Düşük',
  'low': 'Düşük',
};

const TAG_PALETTE = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#3b82f6','#06b6d4','#84cc16','#f97316'];
const getTagColor = (tag) => {
  let h = 0; for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h);
  return TAG_PALETTE[Math.abs(h) % TAG_PALETTE.length];
};

const WeeklyPlanPage = ({ 
  projects, 
  toggleTask, 
  deleteTask, 
  updateTaskNote, 
  updateTaskPriority, 
  updateTaskSubtasks, 
  updateTaskTags, 
  updateTaskDueDate, 
  updateTaskRecurrence,
  resetData, 
  requestNotificationPermission, 
  setIsSidebarCollapsed, 
  isSidebarCollapsed, 
  onLogout, 
  toggleSettings,
  username,
  userId
}) => {
  const [filterProject, setFilterProject] = useState('all');
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [activeTaskNote, setActiveTaskNote] = useState(null);

  const activeProjects = useMemo(() => {
    return projects.filter(p => !p.archived);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return filterProject === 'all'
      ? activeProjects
      : activeProjects.filter(p => p.id?.toString() === filterProject?.toString());
  }, [filterProject, activeProjects]);

  // Combine tasks from all filtered projects
  const allTasks = useMemo(() => {
    return filteredProjects.flatMap(p => 
      (p.tasks || []).map(t => ({ 
        ...t, 
        projectId: p.id,
        projectTitle: p.title,
        projectColor: p.color || '#6366f1'
      }))
    );
  }, [filteredProjects]);

  // Group tasks by week
  const groupedTasks = useMemo(() => {
    return allTasks.reduce((acc, task) => {
      const week = task.week || task.weekIndex || 1;
      if (!acc[week]) acc[week] = [];
      acc[week].push(task);
      return acc;
    }, {});
  }, [allTasks]);

  const weeks = useMemo(() => {
    return Object.keys(groupedTasks).sort((a, b) => parseInt(a) - parseInt(b));
  }, [groupedTasks]);

  // Metrics
  const totalTasks = allTasks.length;
  const completedTasksCount = allTasks.filter(t => t.completed).length;
  const pendingTasksCount = totalTasks - completedTasksCount;
  const globalProgress = totalTasks === 0 ? 0 : Math.round((completedTasksCount / totalTasks) * 100);

  const toggleWeek = (week) => {
    setExpandedWeeks(prev => ({ ...prev, [week]: !prev[week] }));
  };

  const getStatusColor = (prog) => {
    if (prog === 100) return 'var(--status-done)';
    if (prog > 70) return 'var(--status-high)';
    if (prog > 30) return 'var(--status-mid)';
    return 'var(--status-low)';
  };

  // Find the selected task for the note modal
  const selectedTaskObject = useMemo(() => {
    if (!activeTaskNote) return null;
    for (const p of projects) {
      const found = p.tasks.find(t => t.id?.toString() === activeTaskNote?.toString());
      if (found) return { ...found, projectId: p.id };
    }
    return null;
  }, [activeTaskNote, projects]);

  return (
    <div className="auth-layout">
      <Sidebar 
        resetData={resetData} 
        requestNotificationPermission={requestNotificationPermission} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
        isSidebarCollapsed={isSidebarCollapsed} 
        onLogout={onLogout} 
        toggleSettings={toggleSettings} 
      />

      <main className="main-content">
        {activeTaskNote && selectedTaskObject && (
          <TaskNoteModal 
            task={selectedTaskObject}
            projectId={selectedTaskObject.projectId}
            onClose={() => setActiveTaskNote(null)}
            onSave={(taskId, newNote) => updateTaskNote(selectedTaskObject.projectId, taskId, newNote)}
            onPriorityChange={(taskId, p) => updateTaskPriority(selectedTaskObject.projectId, taskId, p)}
            onSubtasksChange={(taskId, subs) => updateTaskSubtasks(selectedTaskObject.projectId, taskId, subs)}
            onTagsChange={(taskId, tags) => updateTaskTags(selectedTaskObject.projectId, taskId, tags)}
            onDueDateChange={(taskId, date) => updateTaskDueDate(selectedTaskObject.projectId, taskId, date)}
            onRecurrenceChange={(taskId, rec) => updateTaskRecurrence(selectedTaskObject.projectId, taskId, rec)}
            currentUsername={username}
            currentUserId={userId}
          />
        )}

        <header className="animate-slide-up" style={{ marginBottom: '2.5rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Haftalık Plan</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tüm projelerindeki haftalık görev dağılımı ve ilerleme durumu.</p>
        </header>

        {/* Metrik Kartları */}
        <section className="stats-container animate-slide-up delay-100" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-done)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tamamlanan Görev</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{completedTasksCount}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-low)' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Bekleyen Görev</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{pendingTasksCount}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Toplam Hafta</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{weeks.length}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--status-high)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Genel İlerleme</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>%{globalProgress}</h3>
            </div>
          </div>
        </section>

        {/* Proje Filtreleyici */}
        <div className="animate-slide-up delay-100" style={{ 
          display: 'flex', 
          gap: '10px', 
          overflowX: 'auto', 
          paddingBottom: '1rem', 
          marginBottom: '2rem',
          scrollbarWidth: 'thin',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <button
            onClick={() => setFilterProject('all')}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: filterProject === 'all' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
              background: filterProject === 'all' ? 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)' : 'rgba(255,255,255,0.03)',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: filterProject === 'all' ? '0 4px 15px rgba(99, 102, 241, 0.25)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Tümü
          </button>
          {activeProjects.map(p => {
            const isSelected = filterProject?.toString() === p.id?.toString();
            return (
              <button
                key={p.id}
                onClick={() => setFilterProject(p.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: isSelected ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? p.color : 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? `0 4px 15px ${p.color}35` : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {p.title}
              </button>
            );
          })}
        </div>

        {/* Hafta Listesi */}
        <section className="animate-slide-up delay-200" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {weeks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <Calendar size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>Görev Bulunmamaktadır</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Haftalık planı görüntülemek için önce projelerinize haftalık görevler planlayın.
              </p>
            </div>
          ) : (
            weeks.map(week => {
              const tasksInWeek = groupedTasks[week] || [];
              const completedInWeek = tasksInWeek.filter(t => t.completed).length;
              const totalInWeek = tasksInWeek.length;
              const weekProgress = totalInWeek === 0 ? 0 : Math.round((completedInWeek / totalInWeek) * 100);
              const weekColor = getStatusColor(weekProgress);
              const isExpanded = expandedWeeks[week] !== false; // Default: expanded
              const isAllDone = weekProgress === 100 && totalInWeek > 0;

              return (
                <div key={week} className={`week-card ${isAllDone ? 'week-done' : ''}`} style={{ '--week-color': weekColor }}>
                  <div className="week-header" onClick={() => toggleWeek(week)}>
                    <div className="week-header-left">
                      <button className="expand-btn">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                      <div className="week-title-area">
                        <h3 className="week-title">Hafta {week}</h3>
                        <span className="week-stats">{completedInWeek}/{totalInWeek} Görev</span>
                      </div>
                    </div>

                    <div className="week-header-right">
                      <div className="week-progress-text" style={{ color: weekColor }}>
                        %{weekProgress}
                      </div>
                      <div className="week-progress-circle">
                        <svg width="36" height="36" viewBox="0 0 36 36">
                          <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="circle-fill" strokeDasharray={`${weekProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: weekColor }} />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="week-content">
                      <div className="task-list">
                        {tasksInWeek.map(task => {
                          const subtasks = task.subtasks || [];
                          const completedSubs = subtasks.filter(s => s.completed).length;
                          const subProgress = subtasks.length === 0 ? 0 : Math.round((completedSubs / subtasks.length) * 100);
                          const tags = task.tags || [];

                          return (
                            <div 
                              key={task.id} 
                              className={`weekly-task-item ${task.completed ? 'task-completed' : ''}`}
                              onClick={() => toggleTask(task.projectId, task.id)}
                            >
                              <div className="task-left" style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                                  {task.completed ? (
                                    <CheckCircle size={20} className="task-icon completed-icon" color="var(--accent)" />
                                  ) : (
                                    <Circle size={20} className="task-icon pending-icon" />
                                  )}
                                  <span className="task-text">{task.text}</span>
                                  
                                  {/* Proje Rozeti */}
                                  <span style={{ 
                                    fontSize: '0.72rem', 
                                    padding: '2px 8px', 
                                    borderRadius: '5px', 
                                    background: `${task.projectColor}15`, 
                                    color: task.projectColor, 
                                    border: `1px solid ${task.projectColor}30`, 
                                    fontWeight: 700 
                                  }}>
                                    {task.projectTitle}
                                  </span>

                                  {/* Öncelik Badge */}
                                  {task.priority && (
                                    <span
                                      className="task-priority-badge"
                                      style={{ color: PRIORITY_COLOR[task.priority] }}
                                      title={`Öncelik: ${PRIORITY_TEXT[task.priority] || task.priority}`}
                                    >
                                      {PRIORITY_LABEL[task.priority]} {PRIORITY_TEXT[task.priority] || task.priority}
                                    </span>
                                  )}

                                  {/* Etiket chip'leri */}
                                  {tags.length > 0 && (
                                    <div className="task-tags-row" style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
                                      {tags.slice(0, 4).map(tag => (
                                        <span key={tag} className="task-tag-chip" style={{ 
                                          '--tag-color': getTagColor(tag),
                                          background: `${getTagColor(tag)}15`,
                                          color: getTagColor(tag),
                                          border: `1px solid ${getTagColor(tag)}30`,
                                          fontSize: '0.7rem',
                                          padding: '1px 6px',
                                          borderRadius: '4px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          fontWeight: 500
                                        }}>
                                          <Tag size={10} style={{ marginRight: 3 }} />{tag}
                                        </span>
                                      ))}
                                      {tags.length > 4 && (
                                        <span className="task-tag-chip" style={{ 
                                          '--tag-color': '#64748b',
                                          background: 'rgba(100, 116, 139, 0.15)',
                                          color: '#64748b',
                                          border: '1px solid rgba(100, 116, 139, 0.3)',
                                          fontSize: '0.7rem',
                                          padding: '1px 6px',
                                          borderRadius: '4px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          fontWeight: 500
                                        }}>+{tags.length - 4}</span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Due Date Badge */}
                                {task.dueDate && !task.completed && (() => {
                                  const due = new Date(task.dueDate);
                                  const today = new Date(); today.setHours(0,0,0,0);
                                  const dueDay = new Date(due); dueDay.setHours(0,0,0,0);
                                  const diff = Math.round((dueDay - today) / 86400000);
                                  const isOverdue = diff < 0;
                                  const isToday = diff === 0;
                                  const isTomorrow = diff === 1;
                                  const color = isOverdue ? 'var(--danger)' : isToday ? 'var(--status-low)' : 'var(--text-secondary)';
                                  const label = isOverdue ? `${Math.abs(diff)} gün geçti` : isToday ? 'Bugün' : isTomorrow ? 'Yarın' : due.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
                                  return (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color, fontWeight: isOverdue || isToday ? 700 : 400 }}>
                                      <Calendar size={11} /> {label}
                                    </span>
                                  );
                                })()}

                                {/* Alt Görev Mini Bar */}
                                {subtasks.length > 0 && (
                                  <div className="subtask-mini-bar">
                                    <div className="subtask-mini-progress">
                                      <div 
                                        className="subtask-mini-fill" 
                                        style={{ width: `${subProgress}%`, background: subProgress === 100 ? 'var(--accent)' : 'var(--primary)' }} 
                                      />
                                    </div>
                                    <span className="subtask-mini-label">{completedSubs}/{subtasks.length} alt görev</span>
                                  </div>
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  className={`task-action-btn ${task.notes ? 'has-notes' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); setActiveTaskNote(task.id); }}
                                  title="Görev Detayları ve Geçmişi"
                                >
                                  <FileText size={18} />
                                </button>
                                <button 
                                  className="task-action-btn delete-btn"
                                  onClick={(e) => { e.stopPropagation(); if (window.confirm("Bu görevi silmek istediğinize emin misiniz?")) deleteTask(task.projectId, task.id); }}
                                  title="Görevi Sil"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {tasksInWeek.length > 0 && (
                        <div className={`weekly-summary-card ${isAllDone ? 'all-done' : ''}`} style={{ margin: '16px' }}>
                          <div className="summary-icon-box">
                            {isAllDone ? <Award size={22} /> : <TrendingUp size={22} />}
                          </div>
                          <div className="summary-content">
                            <h4>
                              {isAllDone 
                                ? "Harika bir hafta! 🎉" 
                                : weekProgress > 50 
                                  ? "Güçlü ilerleme! 💪" 
                                  : "Yolun başındasın! 🚀"}
                            </h4>
                            <p>
                              Bu hafta <b>{completedInWeek}</b> görev tamamladın, <b>%{weekProgress}</b> ilerleme kaydettin.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};

export default WeeklyPlanPage;
