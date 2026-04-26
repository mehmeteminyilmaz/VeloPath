import React, { useState, useRef, useCallback, useEffect } from 'react';
import UndoToast from './components/UndoToast';
import PomodoroTimer from './components/PomodoroTimer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import Stats from './pages/Stats';
import Login from './pages/Login';
import * as api from './api';
import io from 'socket.io-client';
import './styles/App.css';

const SOCKET_URL = 'http://localhost:5000';



const UNDO_DELAY = 5000;

function App() {
  // Global State: İlk yüklemede LocalStorage'dan kontrol et
  // Undo toast state
  const [undoToasts, setUndoToasts] = useState([]);
  const undoTimers = useRef({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('velopath_sidebar_collapsed') === 'true';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('velopath_authenticated') === 'true';
  });

  const [username, setUsername] = useState(() => {
    return localStorage.getItem('velopath_username') || '';
  });

  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('velopath_userid') || '';
  });

  const onLogin = async (name) => {
    try {
      const user = await api.loginUser(name);
      setUsername(user.username);
      setUserId(user._id);
      setIsAuthenticated(true);
      localStorage.setItem('velopath_username', user.username);
      localStorage.setItem('velopath_userid', user._id);
      localStorage.setItem('velopath_authenticated', 'true');
    } catch (error) {
      console.error("Giriş yapılırken hata:", error);
      alert("Giriş yapılırken bir hata oluştu. Sunucu bağlantısını kontrol edin.");
    }
  };

  const onLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('velopath_authenticated', 'false');
    localStorage.removeItem('velopath_userid');
  };

  // Sidebar Daraltma Klavye Kısayolları ( [ ve Z )
  useEffect(() => {
    localStorage.setItem('velopath_sidebar_collapsed', isSidebarCollapsed);
    
    const handleKeyDown = (e) => {
      if (e.key === '[' || e.key === 'z' || e.key === 'Z') {
        // Eğer input/textarea içindeyse tetikleme
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarCollapsed]);

  // Projeler artık backend'den geliyor, localStorage init'e gerek yok
  const [projects, setProjects] = useState([]);

  // Backend'den verileri yükle
  const loadData = useCallback(async () => {
    if (isAuthenticated && userId) {
      const data = await api.fetchAllData(userId);
      if (data && data.length > 0) {
        setProjects(data);
      } else if (data && data.length === 0) {
        setProjects([]);
      }
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Socket.io Gerçek Zamanlı Senkronizasyon
  useEffect(() => {
    if (isAuthenticated && userId) {
      const socket = io(SOCKET_URL);
      
      socket.on('connect', () => {
        socket.emit('join_user_room', userId);
      });

      socket.on('data_updated', () => {
        // Arka planda verileri yenile (UI bloklanmaz, sessizce güncellenir)
        loadData();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, userId, loadData]);

  // Çıkış yapıp temizle
  const resetData = () => {
    if (window.confirm('Oturumu kapatmak istediğinizden emin misiniz?')) {
      onLogout();
    }
  };

  // NOT: Projeler artık backend'den geliyor, localStorage'a yazmaya gerek yok.

  // Tema yükleme
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('velopath_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  // Bildirim İzni İste
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Bu tarayıcı bildirimleri desteklemiyor.");
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        sendTaskNotification();
      }
    } else {
      sendTaskNotification();
    }
  };

  // Aktif haftadaki tamamlanmamış görev sayısını hesapla
  const getIncompleteTaskCount = () => {
    let totalIncomplete = 0;
    
    projects.filter(p => !p.archived).forEach(project => {
      if (project.tasks.length === 0) return;
      
      // En küçük tamamlanmamış görev haftasını bul
      const incompleteTasks = project.tasks.filter(t => !t.completed);
      if (incompleteTasks.length === 0) return;
      
      const minWeek = Math.min(...incompleteTasks.map(t => t.week));
      const activeWeekTasks = incompleteTasks.filter(t => t.week === minWeek);
      
      totalIncomplete += activeWeekTasks.length;
    });
    
    return totalIncomplete;
  };

  // Bildirim Gönder
  const sendTaskNotification = () => {
    const count = getIncompleteTaskCount();
    
    if (count > 0) {
      new Notification("VeloPath Hatırlatıcı 🚀", {
        body: `Bu hafta tamamlaman gereken ${count} adet görev seni bekliyor. Başarılar!`,
        icon: "/favicon.ico"
      });
    } else {
      new Notification("VeloPath 🚀", {
        body: "Bu hafta için bekleyen göreviniz bulunmuyor. Harika gidiyorsunuz!",
        icon: "/favicon.ico"
      });
    }
  };

  // Yeni proje ekleme fonksiyonu
  const addProject = async (newProject) => {
    const { initialTasks = [], ...projectData } = newProject;
    
    // Optimiztik UI: Önce UI'ı güncelle
    const tempId = Date.now().toString();
    const tempProject = { 
      ...projectData, 
      id: tempId, 
      tasks: initialTasks,
      archived: false,
      color: newProject.color || '#6366f1'
    };
    
    setProjects(prev => [...prev, tempProject]);

    // Backend'e kaydet
    try {
      const savedProject = await api.createProject({ ...projectData, user: userId });
      
      // Eğer görevler varsa, onları da arka arkaya kaydet (gerçek hayatta Promise.all kullanılır)
      let savedTasks = [];
      if (initialTasks.length > 0) {
        savedTasks = await Promise.all(initialTasks.map(t => 
          api.createTask({ ...t, projectId: savedProject._id, title: t.text })
        ));
      }

      // Geçici ID'yi gerçek MongoDB ID'si ile değiştir
      setProjects(prev => prev.map(p => p.id === tempId ? { ...savedProject, id: savedProject._id, tasks: savedTasks.map(t => ({...t, id: t._id, text: t.title})) } : p));
    } catch (error) {
      console.error("Proje eklenirken hata:", error);
      // Hata durumunda UI'ı geri al
      setProjects(prev => prev.filter(p => p.id !== tempId));
    }
  };

  // Proje arşivleme/geri yükleme fonksiyonu
  const archiveProject = async (projectId) => {
    const project = projects.find(p => p.id.toString() === projectId.toString());
    if (!project) return;
    
    // Optimistic UI
    setProjects(projects.map(p => {
      if (p.id.toString() === projectId.toString()) {
        return { ...p, archived: !p.archived };
      }
      return p;
    }));

    // API Call
    try {
      await api.updateProject(project.id, { archived: !project.archived });
    } catch (error) {
      console.error(error);
      // Revert on error
      setProjects(projects.map(p => p.id.toString() === projectId.toString() ? { ...p, archived: project.archived } : p));
    }
  };

  // Görev ekleme fonksiyonu
  const addTask = async (projectId, taskText, week = 1, dependsOn = null, priority = 'Orta') => {
    const pid = projectId.toString();
    const now = new Date().toISOString();
    const tempId = Date.now().toString();

    const newTask = { 
      id: tempId, 
      text: taskText, 
      completed: false, 
      week, 
      dependsOn,
      priority,
      subtasks: [],
      createdAt: now,
      history: [{ timestamp: now, action: 'Görevi oluşturdu.' }]
    };

    setProjects(projects.map(p => {
      if (p.id.toString() === pid) {
        return { ...p, tasks: [...p.tasks, newTask] };
      }
      return p;
    }));

    try {
      const savedTask = await api.createTask({
        projectId: pid,
        title: taskText,
        weekIndex: week,
        priority: priority === 'Yüksek' ? 'high' : priority === 'Orta' ? 'medium' : 'low',
        dependsOn,
        history: newTask.history
      });
      
      setProjects(prev => prev.map(p => p.id.toString() === pid ? {
        ...p, tasks: p.tasks.map(t => t.id === tempId ? { ...newTask, id: savedTask._id } : t)
      } : p));
    } catch (error) {
      console.error(error);
      setProjects(prev => prev.map(p => p.id.toString() === pid ? { ...p, tasks: p.tasks.filter(t => t.id !== tempId) } : p));
    }
  };

  // Görev önceliği güncelleme
  const updateTaskPriority = async (projectId, taskId, priority) => {
    const now = new Date().toISOString();
    setProjects(projects.map(p => {
      if (p.id.toString() === projectId.toString()) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id.toString() === taskId.toString()) {
              return {
                ...t,
                priority,
                history: [...(t.history || []), { timestamp: now, action: `Görev önceliğini '${priority}' olarak güncelledi.` }]
              };
            }
            return t;
          })
        };
      }
      return p;
    }));

    try {
      const priorityEnum = priority === 'Yüksek' ? 'high' : priority === 'Orta' ? 'medium' : 'low';
      await api.updateTaskAPI(taskId, { priority: priorityEnum });
    } catch (err) { console.error(err); }
  };

  // Alt görev ekleme / toggle / silme
  const updateTaskSubtasks = async (projectId, taskId, subtasks) => {
    const now = new Date().toISOString();
    setProjects(projects.map(p => {
      if (p.id.toString() === projectId.toString()) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id.toString() === taskId.toString()) {
              return {
                ...t,
                subtasks,
                history: [...(t.history || []), { timestamp: now, action: 'Alt görevleri güncelledi.' }]
              };
            }
            return t;
          })
        };
      }
      return p;
    }));
    try { await api.updateTaskAPI(taskId, { subtasks }); } catch (err) { console.error(err); }
  };

  // Görev etiketleri güncelleme
  const updateTaskTags = async (projectId, taskId, tags) => {
    const now = new Date().toISOString();
    setProjects(projects.map(p => {
      if (p.id.toString() === projectId.toString()) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id.toString() === taskId.toString()) {
              return {
                ...t,
                tags,
                history: [...(t.history || []), { timestamp: now, action: `Etiketleri güncelledi: ${tags.join(', ') || '(temizlendi)'}` }]
              };
            }
            return t;
          })
        };
      }
      return p;
    }));
    try { await api.updateTaskAPI(taskId, { tags }); } catch (err) { console.error(err); }
  };

  // Proje notları güncelleme
  const updateProjectNotes = async (projectId, notes) => {
    setProjects(projects.map(p =>
      p.id.toString() === projectId.toString() ? { ...p, projectNotes: notes } : p
    ));
    try { await api.updateProject(projectId, { notes }); } catch(err) { console.error(err); }
  };

  // Görev durumu değiştirme
  const toggleTask = async (projectId, taskId) => {
    const now = new Date().toISOString();
    let isNowCompleted = false;

    setProjects(projects.map(p => {
      if (p.id.toString() === projectId.toString()) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id.toString() === taskId.toString()) {
              isNowCompleted = !t.completed;
              const historyEntry = {
                timestamp: now,
                action: isNowCompleted ? 'Görevi tamamlandı olarak işaretledi.' : 'Görevi tekrar aktif hale getirdi.'
              };
              return { 
                ...t, 
                completed: isNowCompleted,
                completedAt: isNowCompleted ? now : null,
                history: [...(t.history || []), historyEntry]
              };
            }
            return t;
          })
        };
      }
      return p;
    }));

    try { await api.updateTaskAPI(taskId, { status: isNowCompleted ? 'done' : 'todo' }); } catch(err) { console.error(err); }
  };

  // --- Undo helpers ---
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
  }, []);

  const undoToast = useCallback((toastId) => {
    setUndoToasts(prev => prev.filter(t => t.id !== toastId));
    if (undoTimers.current[toastId]) {
      clearTimeout(undoTimers.current[toastId].timer);
      undoTimers.current[toastId].cancel();
      delete undoTimers.current[toastId];
    }
  }, []);

  // Proje silme fonksiyonu
  const deleteProject = useCallback((projectId) => {
    const pid = projectId.toString();
    const project = projects.find(p => p.id.toString() === pid);
    if (!project) return;

    // Geçici olarak projeden kaldır (anlık UI güncellemesi)
    setProjects(prev => prev.filter(p => p.id.toString() !== pid));

    let committed = false;
    const toastId = addUndoToast({ label: project.title, type: 'project' });

    const timer = setTimeout(async () => {
      committed = true;
      setUndoToasts(prev => prev.filter(t => t.id !== toastId));
      delete undoTimers.current[toastId];
      
      // Backend'den sil
      try {
        await api.deleteProjectAPI(pid);
      } catch (err) {
        console.error(err);
      }
    }, UNDO_DELAY);

    undoTimers.current[toastId] = {
      timer,
      commit: async () => { 
        committed = true; 
        try { await api.deleteProjectAPI(pid); } catch(err) {}
      },
      cancel: () => {
        if (!committed) {
          // Geri yükle
          setProjects(prev => {
            const exists = prev.find(p => p.id.toString() === pid);
            if (exists) return prev;
            return [...prev, project];
          });
        }
      }
    };
  }, [projects, addUndoToast]);

  // Görev silme fonksiyonu
  const deleteTask = useCallback((projectId, taskId) => {
    const pid = projectId.toString();
    const tid = taskId.toString();
    const project = projects.find(p => p.id.toString() === pid);
    if (!project) return;
    const task = project.tasks.find(t => t.id.toString() === tid);
    if (!task) return;

    // Anlık UI güncellemesi
    setProjects(prev => prev.map(p => {
      if (p.id.toString() !== pid) return p;
      return {
        ...p,
        tasks: p.tasks
          .filter(t => t.id.toString() !== tid)
          .map(t => t.dependsOn?.toString() === tid ? { ...t, dependsOn: null } : t)
      };
    }));

    let committed = false;
    const toastId = addUndoToast({ label: task.text, type: 'task' });

    const timer = setTimeout(async () => {
      committed = true;
      setUndoToasts(prev => prev.filter(t => t.id !== toastId));
      delete undoTimers.current[toastId];
      try { await api.deleteTaskAPI(tid); } catch (err) {}
    }, UNDO_DELAY);

    undoTimers.current[toastId] = {
      timer,
      commit: async () => { 
        committed = true; 
        try { await api.deleteTaskAPI(tid); } catch(err) {}
      },
      cancel: () => {
        if (!committed) {
          // Görevi geri yükle
          setProjects(prev => prev.map(p => {
            if (p.id.toString() !== pid) return p;
            const exists = p.tasks.find(t => t.id.toString() === tid);
            if (exists) return p;
            return { ...p, tasks: [...p.tasks, task] };
          }));
        }
      }
    };
  }, [projects, addUndoToast]);

  // Görev notu ekleme/düzenleme
  const updateTaskNote = async (projectId, taskId, newNote) => {
    const now = new Date().toISOString();
    setProjects(projects.map(p => {
      if (p.id.toString() === projectId.toString()) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id.toString() === taskId.toString()) {
              const historyEntry = {
                timestamp: now,
                action: 'Görev notunu güncelledi.'
              };
              return { 
                ...t, 
                notes: newNote,
                history: [...(t.history || []), historyEntry]
              };
            }
            return t;
          })
        };
      }
      return p;
    }));
    try { await api.updateTaskAPI(taskId, { notes: newNote }); } catch(err) {}
  };

  // Görevleri yeniden sıralama (Drag & Drop)
  const reorderTasks = async (projectId, newTasksArray) => {
    const now = new Date().toISOString();
    setProjects(projects.map(p => {
      if (p.id.toString() === projectId.toString()) {
        // Hafta değişikliklerini kontrol et
        const updatedTasks = newTasksArray.map(newTask => {
          const oldTask = p.tasks.find(ot => ot.id.toString() === newTask.id.toString());
          if (oldTask && oldTask.week !== newTask.week) {
            api.updateTaskAPI(newTask.id, { weekIndex: newTask.week }).catch(console.error);
            const historyEntry = {
              timestamp: now,
              action: `Görevi Hafta ${oldTask.week}'den Hafta ${newTask.week}'e taşıdı.`
            };
            return { 
              ...newTask, 
              history: [...(newTask.history || []), historyEntry]
            };
          }
          return newTask;
        });
        return { ...p, tasks: updatedTasks };
      }
      return p;
    }));
  };

  if (!isAuthenticated) {
    return <Login onLogin={onLogin} />;
  }

  return (
    <Router>
      <div className={`App ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} deleteProject={deleteProject} archiveProject={archiveProject} resetData={resetData} sendTaskNotification={sendTaskNotification} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} username={username} onLogout={onLogout} />} />
          <Route path="/create" element={<CreateProject addProject={addProject} resetData={resetData} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} onLogout={onLogout} />} />
          <Route path="/project/:id" element={<ProjectDetails projects={projects} addTask={addTask} toggleTask={toggleTask} deleteProject={deleteProject} deleteTask={deleteTask} updateTaskNote={updateTaskNote} updateTaskPriority={updateTaskPriority} updateTaskSubtasks={updateTaskSubtasks} updateTaskTags={updateTaskTags} updateProjectNotes={updateProjectNotes} reorderTasks={reorderTasks} archiveProject={archiveProject} resetData={resetData} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} onLogout={onLogout} />} />
          <Route path="/stats" element={<Stats projects={projects} resetData={resetData} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} onLogout={onLogout} />} />
          <Route path="*" element={<Dashboard projects={projects} deleteProject={deleteProject} archiveProject={archiveProject} resetData={resetData} sendTaskNotification={sendTaskNotification} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} username={username} onLogout={onLogout} />} />
        </Routes>
        
        {/* Global Undo Toast */}
        <UndoToast toasts={undoToasts} onUndo={undoToast} onDismiss={dismissToast} />

        {/* Global Pomodoro Timer */}
        <PomodoroTimer />
      </div>
    </Router>
  );
}

export default App;
