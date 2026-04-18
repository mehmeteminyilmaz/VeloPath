import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import TaskNoteModal from './TaskNoteModal';
import EmptyState from './EmptyState';
import { ChevronDown, ChevronRight, CheckCircle, Circle, Trash2, Lock, Calendar, FileText, GripVertical, Award, TrendingUp, Tag } from 'lucide-react';

import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

// --- Bireysel Görev (Sortable) Bileşeni ---
const PRIORITY_COLOR = {
  'Yüksek': 'var(--danger)',
  'Orta': 'var(--status-low)',
  'Düşük': 'var(--status-high)',
};
const PRIORITY_LABEL = {
  'Yüksek': '🔴',
  'Orta': '🟡',
  'Düşük': '🟢',
};

const SortableTask = ({ task, locked, dependency, onToggle, onDelete, onNoteOpen }) => {
  const [isShaking, setIsShaking] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id,
    data: { type: 'Task', week: task.week }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 2 : 1,
  };

  const subtasks = task.subtasks || [];
  const completedSubs = subtasks.filter(s => s.completed).length;
  const subProgress = subtasks.length === 0 ? 0 : Math.round((completedSubs / subtasks.length) * 100);
  const tags = task.tags || [];

  // Her etiket için tutarlı renk
  const TAG_PALETTE = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#3b82f6','#06b6d4','#84cc16','#f97316'];
  const getTagColor = (tag) => {
    let h = 0; for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h);
    return TAG_PALETTE[Math.abs(h) % TAG_PALETTE.length];
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`weekly-task-item ${locked ? 'task-locked' : ''} ${task.completed ? 'task-completed' : ''} ${isDragging ? 'dragging' : ''} ${isShaking ? 'shake' : ''}`}
      onClick={(e) => {
        if (isDragging) return;
        if (locked) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
        } else {
          onToggle(task.id);
        }
      }}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="drag-handle-zone"
        style={{ cursor: 'grab', padding: '8px', marginLeft: '-8px', marginRight: '4px', color: 'var(--text-secondary)' }}
      >
        <GripVertical size={16} />
      </div>

      <div className="task-left" style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          {locked ? (
            <Lock size={20} className="task-icon locked-icon" />
          ) : task.completed ? (
            <CheckCircle size={20} className="task-icon completed-icon" color="var(--accent)" />
          ) : (
            <Circle size={20} className="task-icon pending-icon" />
          )}
          <span className="task-text">{task.text}</span>
          {/* Öncelik Badge */}
          {task.priority && !locked && (
            <span
              className="task-priority-badge"
              style={{ color: PRIORITY_COLOR[task.priority] }}
              title={`Öncelik: ${task.priority}`}
            >
              {PRIORITY_LABEL[task.priority]} {task.priority}
            </span>
          )}
          {locked && (
            <span className="locked-badge">Beklenen: {dependency.text}</span>
          )}
        </div>

        {/* Etiket chip'leri */}
        {tags.length > 0 && (
          <div className="task-tags-row">
            {tags.slice(0, 4).map(tag => (
              <span key={tag} className="task-tag-chip" style={{ '--tag-color': getTagColor(tag) }}>
                <Tag size={10} style={{ marginRight: 3 }} />{tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="task-tag-chip" style={{ '--tag-color': '#64748b' }}>+{tags.length - 4}</span>
            )}
          </div>
        )}

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
          onClick={(e) => { e.stopPropagation(); onNoteOpen(task.id); }}
          title="Görev Detayları ve Geçmişi"
        >
          <FileText size={18} />
        </button>
        <button 
          className="task-action-btn delete-btn"
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          title="Görevi Sil"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// --- Droppable Container ---
const DroppableWeekContent = ({ weekId, children, isExpanded }) => {
  const { setNodeRef } = useDroppable({
    id: `week-container-${weekId}`,
    data: { type: 'Week', week: weekId }
  });

  return (
    <div ref={setNodeRef} className="week-content" style={{ display: isExpanded ? 'block' : 'none', minHeight: '60px' }}>
      <div className="task-list">
        {children}
      </div>
    </div>
  );
};


const WeeklyPlan = ({ project, toggleTask, deleteTask, updateTaskNote, updateTaskPriority, updateTaskSubtasks, updateTaskTags, reorderTasks }) => {
  const [activeTaskNote, setActiveTaskNote] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);
  
  const [tasks, setTasks] = useState(project.tasks);

  useEffect(() => { 
    setTasks(project.tasks); 
  }, [project.tasks]);

  const groupedTasks = tasks.reduce((acc, task) => {
    const week = task.week || 1;
    if (!acc[week]) acc[week] = [];
    acc[week].push(task);
    return acc;
  }, {});

  const weeks = Object.keys(groupedTasks).sort((a, b) => parseInt(a) - parseInt(b));

  const [expandedWeeks, setExpandedWeeks] = useState(() => {
    return weeks.reduce((acc, week) => {
      const ts = groupedTasks[week] || [];
      const completed = ts.every(t => t.completed);
      acc[week] = !completed;
      return acc;
    }, {});
  });

  const toggleWeek = (week) => {
    setExpandedWeeks(prev => ({ ...prev, [week]: !prev[week] }));
  };

  const getDependency = (task) => {
    if (!task.dependsOn) return null;
    return tasks.find(t => t.id === task.dependsOn);
  };

  const getStatusColor = (prog) => {
    if (prog === 100) return 'var(--status-done)';
    if (prog > 70) return 'var(--status-high)';
    if (prog > 30) return 'var(--status-mid)';
    return 'var(--status-low)';
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const overIsTask = tasks.some(t => t.id === overId);
    
    if (overIsTask) {
      const overTask = tasks.find(t => t.id === overId);
      
      if (activeTask.week !== overTask.week) {
        setTasks((prev) => {
          const activeIndex = prev.findIndex(t => t.id === activeId);
          const overIndex = prev.findIndex(t => t.id === overId);
          let newTasks = [...prev];
          newTasks[activeIndex] = { ...newTasks[activeIndex], week: overTask.week };
          return arrayMove(newTasks, activeIndex, overIndex);
        });
      }
    } else {
      const isOverContainer = String(overId).startsWith('week-container-');
      if (isOverContainer) {
        const targetWeek = parseInt(String(overId).replace('week-container-', ''));
        if (targetWeek && activeTask.week !== targetWeek) {
          setTasks((prev) => {
            const activeIndex = prev.findIndex(t => t.id === activeId);
            let newTasks = [...prev];
            newTasks[activeIndex] = { ...newTasks[activeIndex], week: targetWeek };
            return newTasks;
          });
        }
      }
    }
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null);
    const { active, over } = event;
    
    if (!over) {
      if (reorderTasks) reorderTasks(project.id, tasks);
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;

    let finalTasks = [...tasks];
    
    if (activeId !== overId) {
      const activeIndex = finalTasks.findIndex(t => t.id === activeId);
      const overIndex = finalTasks.findIndex(t => t.id === overId);
      
      if (overIndex !== -1) {
        finalTasks = arrayMove(finalTasks, activeIndex, overIndex);
      }
    }

    setTasks(finalTasks);
    if (reorderTasks) {
      reorderTasks(project.id, finalTasks);
    }
  };

  if (weeks.length === 0) {
    return (
      <EmptyState 
        icon={Calendar}
        title="Henüz Görev Planlanmadı"
        description="Projeniz için henüz bir görev eklenmemiş. 'Düzenle' moduna geçerek veya şablonları kullanarak ilk görevinizi planlayabilirsiniz."
      />
    );
  }

  const activeDraggingTask = activeDragId ? tasks.find(t => t.id === activeDragId) : null;

  return (
    <div className="weekly-plan-container animate-slide-up delay-100">
      {activeTaskNote && (
        <TaskNoteModal 
          task={project.tasks.find(t => t.id === activeTaskNote)}
          projectId={project.id}
          onClose={() => setActiveTaskNote(null)}
          onSave={(taskId, newNote) => updateTaskNote(project.id, taskId, newNote)}
          onPriorityChange={updateTaskPriority ? (taskId, p) => updateTaskPriority(project.id, taskId, p) : null}
          onSubtasksChange={updateTaskSubtasks ? (taskId, subs) => updateTaskSubtasks(project.id, taskId, subs) : null}
          onTagsChange={updateTaskTags ? (taskId, tags) => updateTaskTags(project.id, taskId, tags) : null}
        />
      )}

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart} 
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {weeks.map((week, index) => {
          const tasksInWeek = groupedTasks[week] || [];
          const completedInWeek = tasksInWeek.filter(t => t.completed).length;
          const totalInWeek = tasksInWeek.length;
          const weekProgress = totalInWeek === 0 ? 0 : Math.round((completedInWeek / totalInWeek) * 100);
          const weekColor = getStatusColor(weekProgress);
          const isExpanded = expandedWeeks[week];
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

              <DroppableWeekContent weekId={week} isExpanded={isExpanded}>
                <SortableContext items={tasksInWeek.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {tasksInWeek.map(task => {
                    const dependency = getDependency(task);
                    const locked = dependency ? !dependency.completed : false;
                    
                    return (
                      <SortableTask 
                        key={task.id} 
                        task={task} 
                        locked={locked} 
                        dependency={dependency} 
                        onToggle={(id) => toggleTask(project.id, id)} 
                        onDelete={(id) => deleteTask(project.id, id)} 
                        onNoteOpen={(id) => setActiveTaskNote(id)} 
                      />
                    );
                  })}
                </SortableContext>
                
                {tasksInWeek.length > 0 && (
                  <div className={`weekly-summary-card ${isAllDone ? 'all-done' : ''}`}>
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
              </DroppableWeekContent>
            </div>
          );
        })}

        {/* --- Drag Overlay: Transform Stacking Context Fix --- */}
        {typeof document !== 'undefined' && createPortal(
          <DragOverlay zIndex={2000} dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeDraggingTask ? (
              <div style={{ width: '100%', minWidth: '350px' }}>
                <div 
                  className="weekly-task-item dragging-overlay" 
                  style={{ 
                    opacity: 0.95, 
                    boxShadow: '0 15px 40px rgba(0,0,0,0.6)', 
                    cursor: 'grabbing', 
                    border: '1px outset var(--primary)', 
                    background: 'var(--bg-card)', 
                    transform: 'scale(1.03)', 
                    transition: 'none' 
                  }}
                >
                  <div style={{ padding: '8px', marginLeft: '-8px', marginRight: '4px', color: 'var(--primary)' }}>
                     <GripVertical size={16} />
                  </div>
                  <div className="task-left" style={{ flex: 1 }}>
                    {activeDraggingTask.completed ? (
                      <CheckCircle size={20} className="task-icon completed-icon" color="var(--accent)" />
                    ) : (
                      <Circle size={20} className="task-icon pending-icon" style={{ opacity: 0.7 }} />
                    )}
                    <span className="task-text">{activeDraggingTask.text}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

export default WeeklyPlan;

