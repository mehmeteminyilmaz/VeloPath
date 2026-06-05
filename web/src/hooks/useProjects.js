import { useState, useCallback, useRef } from 'react';
import * as api from '../api';

const UNDO_DELAY = 5000;

export function useProjects(userId, isAuthenticated) {
  const [projects, setProjects] = useState([]);
  const undoTimers = useRef({});

  // --- Veri yükleme ---
  const loadData = useCallback(async () => {
    if (!isAuthenticated || !userId) return;
    const data = await api.fetchAllData(userId);
    if (data != null) setProjects(data);
  }, [isAuthenticated, userId]);

  // --- Proje işlemleri ---
  const addProject = async (newProject) => {
    const { initialTasks = [], ...projectData } = newProject;
    const tempId = Date.now().toString();
    const tempProject = { ...projectData, id: tempId, tasks: initialTasks, archived: false, color: newProject.color || '#6366f1' };
    setProjects(prev => [...prev, tempProject]);

    try {
      const savedProject = await api.createProject({ ...projectData, user: userId });
      let savedTasks = [];
      if (initialTasks.length > 0) {
        savedTasks = await Promise.all(
          initialTasks.map(t => api.createTask({ ...t, projectId: savedProject._id, title: t.text }))
        );
      }
      setProjects(prev => prev.map(p =>
        p.id === tempId
          ? { ...savedProject, id: savedProject._id, tasks: savedTasks.map(t => ({ ...t, id: t._id, text: t.title })) }
          : p
      ));
    } catch (error) {
      console.error('Proje eklenirken hata:', error);
      setProjects(prev => prev.filter(p => p.id !== tempId));
    }
  };

  const archiveProject = async (projectId) => {
    const pid = projectId.toString();
    const project = projects.find(p => p.id.toString() === pid);
    if (!project) return;
    setProjects(prev => prev.map(p => p.id.toString() === pid ? { ...p, archived: !p.archived } : p));
    try {
      await api.updateProject(pid, { archived: !project.archived });
    } catch (error) {
      console.error(error);
      setProjects(prev => prev.map(p => p.id.toString() === pid ? { ...p, archived: project.archived } : p));
    }
  };

  const updateProjectNotes = async (projectId, notes) => {
    const pid = projectId.toString();
    setProjects(prev => prev.map(p => p.id.toString() === pid ? { ...p, projectNotes: notes } : p));
    try { await api.updateProject(pid, { notes }); } catch (err) { console.error(err); }
  };

  const deleteProject = useCallback((projectId, addUndoToast) => {
    const pid = projectId.toString();
    const project = projects.find(p => p.id.toString() === pid);
    if (!project) return;

    setProjects(prev => prev.filter(p => p.id.toString() !== pid));

    let committed = false;
    const toastId = addUndoToast({ label: project.title, type: 'project' });
    const timer = setTimeout(async () => {
      committed = true;
      try { await api.deleteProjectAPI(pid); } catch (err) { console.error(err); }
    }, UNDO_DELAY);

    undoTimers.current[toastId] = {
      timer,
      commit: async () => { committed = true; try { await api.deleteProjectAPI(pid); } catch (_) {} },
      cancel: () => {
        if (!committed) {
          setProjects(prev => {
            const exists = prev.find(p => p.id.toString() === pid);
            return exists ? prev : [...prev, project];
          });
        }
      }
    };
    return toastId;
  }, [projects]);

  // --- Görev işlemleri ---
  const addTask = async (projectId, taskText, week = 1, dependsOn = null, priority = 'Orta') => {
    const pid = projectId.toString();
    const now = new Date().toISOString();
    const tempId = Date.now().toString();
    const newTask = { id: tempId, text: taskText, completed: false, week, dependsOn, priority, subtasks: [], createdAt: now, history: [{ timestamp: now, action: 'Görevi oluşturdu.' }] };

    setProjects(prev => prev.map(p => p.id.toString() === pid ? { ...p, tasks: [...p.tasks, newTask] } : p));

    try {
      const savedTask = await api.createTask({
        projectId: pid, title: taskText, weekIndex: week,
        priority: priority === 'Yüksek' ? 'high' : priority === 'Orta' ? 'medium' : 'low',
        dependsOn, history: newTask.history
      });
      setProjects(prev => prev.map(p => p.id.toString() === pid
        ? { ...p, tasks: p.tasks.map(t => t.id === tempId ? { ...newTask, id: savedTask._id } : t) }
        : p
      ));
    } catch (error) {
      console.error(error);
      setProjects(prev => prev.map(p => p.id.toString() === pid ? { ...p, tasks: p.tasks.filter(t => t.id !== tempId) } : p));
    }
  };

  const toggleTask = async (projectId, taskId) => {
    const pid = projectId.toString();
    const tid = taskId.toString();
    const now = new Date().toISOString();
    let previousTasks = null;

    setProjects(prev => prev.map(p => {
      if (p.id.toString() !== pid) return p;
      previousTasks = p.tasks;
      return {
        ...p,
        tasks: p.tasks.map(t => {
          if (t.id.toString() !== tid) return t;
          const isNowCompleted = !t.completed;
          return { ...t, completed: isNowCompleted, completedAt: isNowCompleted ? now : null, history: [...(t.history || []), { timestamp: now, action: isNowCompleted ? 'Görevi tamamlandı olarak işaretledi.' : 'Görevi tekrar aktif hale getirdi.' }] };
        })
      };
    }));

    try {
      const updatedTask = await api.toggleTaskAPI(tid);
      setProjects(prev => prev.map(p => {
        if (p.id.toString() !== pid) return p;
        return { ...p, tasks: p.tasks.map(t => t.id.toString() === tid ? { ...t, completedAt: updatedTask.completedAt ?? null } : t) };
      }));
    } catch (err) {
      console.error('Toggle görev hatası:', err);
      if (previousTasks !== null) {
        setProjects(prev => prev.map(p => p.id.toString() === pid ? { ...p, tasks: previousTasks } : p));
      }
    }
  };

  const updateTaskPriority = async (projectId, taskId, priority) => {
    const pid = projectId.toString();
    const tid = taskId.toString();
    const now = new Date().toISOString();
    setProjects(prev => prev.map(p => p.id.toString() !== pid ? p : {
      ...p,
      tasks: p.tasks.map(t => t.id.toString() !== tid ? t : { ...t, priority, history: [...(t.history || []), { timestamp: now, action: `Görev önceliğini '${priority}' olarak güncelledi.` }] })
    }));
    try { await api.updateTaskAPI(tid, { priority: priority === 'Yüksek' ? 'high' : priority === 'Orta' ? 'medium' : 'low' }); } catch (err) { console.error(err); }
  };

  const updateTaskSubtasks = async (projectId, taskId, subtasks) => {
    const pid = projectId.toString();
    const tid = taskId.toString();
    const now = new Date().toISOString();
    setProjects(prev => prev.map(p => p.id.toString() !== pid ? p : {
      ...p,
      tasks: p.tasks.map(t => t.id.toString() !== tid ? t : { ...t, subtasks, history: [...(t.history || []), { timestamp: now, action: 'Alt görevleri güncelledi.' }] })
    }));
    try { await api.updateTaskAPI(tid, { subtasks }); } catch (err) { console.error(err); }
  };

  const updateTaskTags = async (projectId, taskId, tags) => {
    const pid = projectId.toString();
    const tid = taskId.toString();
    const now = new Date().toISOString();
    setProjects(prev => prev.map(p => p.id.toString() !== pid ? p : {
      ...p,
      tasks: p.tasks.map(t => t.id.toString() !== tid ? t : { ...t, tags, history: [...(t.history || []), { timestamp: now, action: `Etiketleri güncelledi: ${tags.join(', ') || '(temizlendi)'}` }] })
    }));
    try { await api.updateTaskAPI(tid, { tags }); } catch (err) { console.error(err); }
  };

  const updateTaskNote = async (projectId, taskId, newNote) => {
    const pid = projectId.toString();
    const tid = taskId.toString();
    const now = new Date().toISOString();
    setProjects(prev => prev.map(p => p.id.toString() !== pid ? p : {
      ...p,
      tasks: p.tasks.map(t => t.id.toString() !== tid ? t : { ...t, notes: newNote, history: [...(t.history || []), { timestamp: now, action: 'Görev notunu güncelledi.' }] })
    }));
    try { await api.updateTaskAPI(tid, { notes: newNote }); } catch (err) { console.error(err); }
  };

  const deleteTask = useCallback((projectId, taskId, addUndoToast) => {
    const pid = projectId.toString();
    const tid = taskId.toString();
    const project = projects.find(p => p.id.toString() === pid);
    if (!project) return;
    const task = project.tasks.find(t => t.id.toString() === tid);
    if (!task) return;

    setProjects(prev => prev.map(p => {
      if (p.id.toString() !== pid) return p;
      return { ...p, tasks: p.tasks.filter(t => t.id.toString() !== tid).map(t => t.dependsOn?.toString() === tid ? { ...t, dependsOn: null } : t) };
    }));

    let committed = false;
    const toastId = addUndoToast({ label: task.text, type: 'task' });
    const timer = setTimeout(async () => {
      committed = true;
      try { await api.deleteTaskAPI(tid); } catch (err) { console.error(err); }
    }, UNDO_DELAY);

    undoTimers.current[toastId] = {
      timer,
      commit: async () => { committed = true; try { await api.deleteTaskAPI(tid); } catch (_) {} },
      cancel: () => {
        if (!committed) {
          setProjects(prev => prev.map(p => {
            if (p.id.toString() !== pid) return p;
            const exists = p.tasks.find(t => t.id.toString() === tid);
            if (exists) return p;
            const originalProject = projects.find(pr => pr.id.toString() === pid);
            const originalIndex = originalProject ? originalProject.tasks.findIndex(t => t.id.toString() === tid) : -1;
            const newTasks = [...p.tasks];
            if (originalIndex >= 0 && originalIndex <= newTasks.length) newTasks.splice(originalIndex, 0, task);
            else newTasks.push(task);
            return { ...p, tasks: newTasks };
          }));
        }
      }
    };
    return toastId;
  }, [projects]);

  const reorderTasks = async (projectId, newTasksArray) => {
    const pid = projectId.toString();
    const now = new Date().toISOString();
    setProjects(prev => prev.map(p => {
      if (p.id.toString() !== pid) return p;
      const updatedTasks = newTasksArray.map((newTask, index) => {
        const oldTask = p.tasks.find(ot => ot.id.toString() === newTask.id.toString());
        const weekChanged = oldTask && oldTask.week !== newTask.week;
        return weekChanged
          ? { ...newTask, orderIndex: index, history: [...(newTask.history || []), { timestamp: now, action: `Görevi Hafta ${oldTask.week}'den Hafta ${newTask.week}'e taşıdı.` }] }
          : { ...newTask, orderIndex: index };
      });
      return { ...p, tasks: updatedTasks };
    }));

    try {
      const project = projects.find(p => p.id.toString() === pid);
      await Promise.all(newTasksArray.map((newTask, index) => {
        const oldTask = project?.tasks.find(ot => ot.id.toString() === newTask.id.toString());
        const updates = { orderIndex: index };
        if (oldTask && oldTask.week !== newTask.week) updates.weekIndex = newTask.week;
        return api.updateTaskAPI(newTask.id, updates).catch(console.error);
      }));
    } catch (err) {
      console.error('Sıralama kaydedilemedi:', err);
    }
  };

  return {
    projects, setProjects, loadData, undoTimers,
    addProject, archiveProject, updateProjectNotes, deleteProject,
    addTask, toggleTask, deleteTask, updateTaskPriority, updateTaskSubtasks, updateTaskTags, updateTaskNote, reorderTasks,
  };
}
