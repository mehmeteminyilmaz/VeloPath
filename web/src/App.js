import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UndoToast from './components/UndoToast';
import PomodoroTimer from './components/PomodoroTimer';
import SettingsModal from './components/SettingsModal';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import Stats from './pages/Stats';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';
import io from 'socket.io-client';
import './styles/App.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function App() {
  const { isAuthenticated, username, setUsername, userId, onLogin, onRegister, onLogout } = useAuth();
  const {
    projects, setProjects, loadData, undoTimers,
    addProject, archiveProject, updateProjectNotes, deleteProject: deleteProjectBase,
    addTask, toggleTask, deleteTask: deleteTaskBase,
    updateTaskPriority, updateTaskSubtasks, updateTaskTags, updateTaskNote, updateTaskDueDate, updateTaskRecurrence, reorderTasks,
  } = useProjects(userId, isAuthenticated);

  const [undoToasts, setUndoToasts] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    localStorage.getItem('velopath_sidebar_collapsed') === 'true'
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('velopath_theme') || 'dark');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('velopath_accent') || '#6366f1');

  // Sidebar klavye kısayolu
  useEffect(() => {
    localStorage.setItem('velopath_sidebar_collapsed', isSidebarCollapsed);
    const handleKeyDown = (e) => {
      if (e.key === '[' || e.key === 'z' || e.key === 'Z') {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarCollapsed]);

  // İlk veri yükleme
  useEffect(() => { loadData(); }, [loadData]);

  // Socket.io gerçek zamanlı senkronizasyon
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const socket = io(SOCKET_URL);
    socket.on('connect', () => socket.emit('join_user_room', userId));
    socket.on('data_updated', () => loadData());
    return () => socket.disconnect();
  }, [isAuthenticated, userId, loadData]);

  // Tema
  useEffect(() => { document.body.setAttribute('data-theme', theme); }, [theme]);

  // Accent rengi
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', accentColor);
    // Transparan versiyonu da hesapla (hover, badge arka plani icin)
    document.documentElement.style.setProperty('--primary-rgb', accentColor);
  }, [accentColor]);

  // Due date hatirlatici — veriler yüklendikten sonra bir kez calistir
  useEffect(() => {
    if (!isAuthenticated || projects.length === 0) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const urgentTasks = [];
    projects.filter(p => !p.archived).forEach(p => {
      p.tasks.filter(t => !t.completed && t.dueDate).forEach(t => {
        const due = new Date(t.dueDate); due.setHours(0, 0, 0, 0);
        const diff = Math.round((due - today) / 86400000);
        if (diff <= 1) urgentTasks.push({ text: t.text, diff, project: p.title });
      });
    });

    if (urgentTasks.length > 0) {
      const overdue = urgentTasks.filter(t => t.diff < 0).length;
      const todayCount = urgentTasks.filter(t => t.diff === 0).length;
      const tomorrowCount = urgentTasks.filter(t => t.diff === 1).length;

      let body = '';
      if (overdue > 0) body += overdue + ' görev geçikti! ';
      if (todayCount > 0) body += todayCount + ' görev bugün bitiyor. ';
      if (tomorrowCount > 0) body += tomorrowCount + ' görev yarın bitiyor.';

      new Notification('VeloPath - Hatırlatıcı', { body: body.trim(), icon: '/favicon.ico' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, isAuthenticated]);

  // --- Undo sistemi ---
  const addUndoToast = useCallback((toastData) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setUndoToasts(prev => [...prev, { id, ...toastData }]);
    return id;
  }, []);

  const dismissToast = useCallback((toastId) => {
    setUndoToasts(prev => prev.filter(t => t.id !== toastId));
    if (undoTimers.current[toastId]) {
      undoTimers.current[toastId].commit();
      delete undoTimers.current[toastId];
    }
  }, [undoTimers]);

  const undoToast = useCallback((toastId) => {
    setUndoToasts(prev => prev.filter(t => t.id !== toastId));
    if (undoTimers.current[toastId]) {
      clearTimeout(undoTimers.current[toastId].timer);
      undoTimers.current[toastId].cancel();
      delete undoTimers.current[toastId];
    }
  }, [undoTimers]);

  // Hook'taki deleteProject ve deleteTask'a addUndoToast'u bağla
  const deleteProject = useCallback((projectId) => {
    deleteProjectBase(projectId, addUndoToast);
  }, [deleteProjectBase, addUndoToast]);

  const deleteTask = useCallback((projectId, taskId) => {
    deleteTaskBase(projectId, taskId, addUndoToast);
  }, [deleteTaskBase, addUndoToast]);

  // Bildirim
  const getIncompleteTaskCount = () => {
    let totalIncomplete = 0;
    projects.filter(p => !p.archived).forEach(project => {
      const incompleteTasks = project.tasks.filter(t => !t.completed);
      if (incompleteTasks.length === 0) return;
      const minWeek = Math.min(...incompleteTasks.map(t => t.week));
      totalIncomplete += incompleteTasks.filter(t => t.week === minWeek).length;
    });
    return totalIncomplete;
  };

  const sendTaskNotification = () => {
    const count = getIncompleteTaskCount();
    new Notification('VeloPath Hatırlatıcı 🚀', {
      body: count > 0 ? `Bu hafta tamamlaman gereken ${count} adet görev seni bekliyor. Başarılar!` : 'Bu hafta için bekleyen göreviniz bulunmuyor. Harika gidiyorsunuz!',
      icon: '/favicon.ico'
    });
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) { alert('Bu tarayıcı bildirimleri desteklemiyor.'); return; }
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') sendTaskNotification();
    } else {
      sendTaskNotification();
    }
  };

  const resetData = async () => {
    if (window.confirm('Oturumu kapatmak istediginizden emin misiniz?')) {
      setProjects([]);
      await onLogout();
    }
  };

  const toggleSettings = () => setIsSettingsOpen(prev => !prev);

  const sharedProps = {
    resetData, requestNotificationPermission,
    setIsSidebarCollapsed, isSidebarCollapsed, onLogout, toggleSettings,
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Login onLogin={onLogin} onRegister={onRegister} />} />
        </Routes>
      ) : (
        <div className={`App ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Routes>
            <Route path="/" element={<Dashboard projects={projects} deleteProject={deleteProject} archiveProject={archiveProject} sendTaskNotification={sendTaskNotification} username={username} {...sharedProps} />} />
            <Route path="/create" element={<CreateProject addProject={addProject} {...sharedProps} />} />
            <Route path="/project/:id" element={<ProjectDetails projects={projects} addTask={addTask} toggleTask={toggleTask} deleteProject={deleteProject} deleteTask={deleteTask} updateTaskNote={updateTaskNote} updateTaskPriority={updateTaskPriority} updateTaskSubtasks={updateTaskSubtasks} updateTaskTags={updateTaskTags} updateTaskDueDate={updateTaskDueDate} updateTaskRecurrence={updateTaskRecurrence} updateProjectNotes={updateProjectNotes} reorderTasks={reorderTasks} archiveProject={archiveProject} username={username} userId={userId} {...sharedProps} />} />
            <Route path="/stats" element={<Stats projects={projects} {...sharedProps} />} />
            <Route path="*" element={<Dashboard projects={projects} deleteProject={deleteProject} archiveProject={archiveProject} sendTaskNotification={sendTaskNotification} username={username} {...sharedProps} />} />
          </Routes>

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            username={username}
            userId={userId}
            setUsername={setUsername}
            theme={theme}
            setTheme={(newTheme) => { setTheme(newTheme); localStorage.setItem('velopath_theme', newTheme); }}
            accentColor={accentColor}
            setAccentColor={(c) => { setAccentColor(c); localStorage.setItem('velopath_accent', c); }}
            requestNotificationPermission={requestNotificationPermission}
            resetData={onLogout}
          />

          <UndoToast toasts={undoToasts} onUndo={undoToast} onDismiss={dismissToast} />
          <PomodoroTimer />
        </div>
      )}
    </Router>
  );
}

export default App;
