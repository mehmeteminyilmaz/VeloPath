import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import './styles/App.css';

const defaultProjects = [
  { 
    id: 1, 
    title: "VeloPath Web Geliştirme", 
    description: "React ile ana kontrol paneli oluşturma.",
    priority: "Yüksek",
    deadline: "2026-04-15",
    status: "Devam Ediyor",
    archived: false,
    color: "#6366f1", // Indigo
    tasks: [
      { id: 1, text: "React Router Kurulumu", completed: true, week: 1, dependsOn: null, createdAt: new Date('2026-03-25T10:00:00Z').toISOString(), completedAt: new Date('2026-03-25T12:00:00Z').toISOString(), history: [{ timestamp: new Date('2026-03-25T10:00:00Z').toISOString(), action: 'Görevi oluşturdu.' }] },
      { id: 2, text: "Dashboard Tasarımı", completed: true, week: 1, dependsOn: 1, createdAt: new Date('2026-03-26T09:00:00Z').toISOString(), completedAt: new Date('2026-03-27T15:00:00Z').toISOString(), history: [{ timestamp: new Date('2026-03-26T09:00:00Z').toISOString(), action: 'Görevi oluşturdu.' }] },
      { id: 3, text: "State Management Entegrasyonu", completed: false, week: 2, dependsOn: 2, createdAt: new Date('2026-03-28T14:00:00Z').toISOString(), history: [{ timestamp: new Date('2026-03-28T14:00:00Z').toISOString(), action: 'Görevi oluşturdu.' }] }
    ] 
  },
  {
    id: 2,
    title: "cybersec",
    description: "Siber güvenlik araçları ve projeleri monorepo.",
    priority: "Orta",
    deadline: "2026-03-01",
    status: "Tamamlandı",
    archived: true,
    color: "#10b981", // Emerald
    tasks: [
      { id: 1, text: "Port Scanner Geliştirme", completed: true, week: 1, dependsOn: null, createdAt: new Date('2026-02-20T08:00:00Z').toISOString(), completedAt: new Date('2026-02-21T18:00:00Z').toISOString(), history: [{ timestamp: new Date('2026-02-20T08:00:00Z').toISOString(), action: 'Görevi oluşturdu.' }] },
      { id: 2, text: "Network Sniffer Modülü", completed: true, week: 2, dependsOn: 1, createdAt: new Date('2026-02-22T10:00:00Z').toISOString(), completedAt: new Date('2026-02-25T14:00:00Z').toISOString(), history: [{ timestamp: new Date('2026-02-22T10:00:00Z').toISOString(), action: 'Görevi oluşturdu.' }] }
    ]
  },
  {
    id: 3,
    title: "gunce",
    description: "Dart/Flutter ile kişisel günlük ve hafıza asistanı.",
    priority: "Düşük",
    deadline: "2026-02-15",
    status: "Tamamlandı",
    archived: true,
    color: "#f59e0b", // Amber
    tasks: [
      { id: 1, text: "Sesli Not Özelliği", completed: true, week: 1, dependsOn: null, createdAt: new Date('2026-01-10T11:00:00Z').toISOString(), completedAt: new Date('2026-01-12T16:00:00Z').toISOString(), history: [{ timestamp: new Date('2026-01-10T11:00:00Z').toISOString(), action: 'Görevi oluşturdu.' }] },
      { id: 2, text: "AI Chat Entegrasyonu", completed: true, week: 2, dependsOn: 1, createdAt: new Date('2026-01-13T09:00:00Z').toISOString(), completedAt: new Date('2026-01-20T12:00:00Z').toISOString(), history: [{ timestamp: new Date('2026-01-13T09:00:00Z').toISOString(), action: 'Görevi oluşturdu.' }] }
    ]
  },
  {
    id: 4,
    title: "TarimAsistan",
    description: "Bitki takibi ve tarım yönetim uygulaması.",
    priority: "Yüksek",
    deadline: "2026-01-20",
    status: "Tamamlandı",
    archived: true,
    color: "#ef4444", // Rose/Red
    tasks: [
      { id: 1, text: "Firebase Veritabanı Kurulumu", completed: true, week: 1, dependsOn: null, createdAt: new Date('2026-01-01T10:00:00Z').toISOString(), completedAt: new Date('2026-01-02T15:00:00Z').toISOString(), history: [{ timestamp: new Date('2026-01-01T10:00:00Z').toISOString(), action: 'Görevi oluşturdu.' }] },
      { id: 2, text: "Bitki Takibi Arayüzü", completed: true, week: 1, dependsOn: 1, createdAt: new Date('2026-01-03T11:00:00Z').toISOString(), completedAt: new Date('2026-01-10T17:00:00Z').toISOString(), history: [{ timestamp: new Date('2026-01-03T11:00:00Z').toISOString(), action: 'Görevi oluşturdu.' }] }
    ]
  }
];

function App() {
  // Global State: İlk yüklemede LocalStorage'dan kontrol et
  const [projects, setProjects] = useState(() => {
    try {
      const savedProjects = localStorage.getItem('velopath_projects');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        
        // Eğer kullanıcıda hiç aktif proje yoksa, defaultları geri yükleyelim
        if (parsed.length === 0) return defaultProjects;

        const existingTitles = parsed.map(p => p.title);
        const missingSamples = defaultProjects.filter(p => !existingTitles.includes(p.title));
        
        if (missingSamples.length > 0) {
          return [...parsed, ...missingSamples];
        }
        return parsed;
      }
    } catch (error) {
      console.error("LocalStorage load error:", error);
    }
    return defaultProjects;
  });

  // Verileri fabrika ayarlarına döndür
  const resetData = () => {
    if (window.confirm('Tüm veriler silinecek ve örnek veriler geri yüklenecek. Emin misiniz?')) {
      setProjects(defaultProjects);
      localStorage.setItem('velopath_projects', JSON.stringify(defaultProjects));
      window.location.reload(); // Temiz bir başlangıç için
    }
  };

  // Projeler değiştiğinde localStorage'a kaydet
  React.useEffect(() => {
    localStorage.setItem('velopath_projects', JSON.stringify(projects));
  }, [projects]);

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
  const addProject = (newProject) => {
    const { initialTasks = [], ...projectData } = newProject;
    setProjects([...projects, { 
      ...projectData, 
      id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1, 
      tasks: initialTasks,
      archived: false,
      color: newProject.color || '#6366f1'
    }]);
  };

  // Proje arşivleme/geri yükleme fonksiyonu
  const archiveProject = (projectId) => {
    setProjects(projects.map(p => {
      if (p.id === parseInt(projectId)) {
        return { ...p, archived: !p.archived };
      }
      return p;
    }));
  };

  // Görev ekleme fonksiyonu
  const addTask = (projectId, taskText, week = 1, dependsOn = null) => {
    setProjects(projects.map(p => {
      if (p.id === parseInt(projectId)) {
        const nextId = p.tasks.length > 0 ? Math.max(...p.tasks.map(t => t.id)) + 1 : 1;
        const now = new Date().toISOString();
        const newTask = { 
          id: nextId, 
          text: taskText, 
          completed: false, 
          week, 
          dependsOn,
          createdAt: now,
          history: [{ timestamp: now, action: 'Görevi oluşturdu.' }]
        };
        return {
          ...p,
          tasks: [...p.tasks, newTask]
        };
      }
      return p;
    }));
  };

  // Görev durumu değiştirme
  const toggleTask = (projectId, taskId) => {
    const now = new Date().toISOString();
    setProjects(projects.map(p => {
      if (p.id === parseInt(projectId)) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              const isNowCompleted = !t.completed;
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
  };

  // Proje silme fonksiyonu
  const deleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== parseInt(projectId)));
  };

  // Görev silme fonksiyonu
  const deleteTask = (projectId, taskId) => {
    setProjects(projects.map(p => {
      if (p.id === parseInt(projectId)) {
        return {
          ...p,
          tasks: p.tasks
            .filter(t => t.id !== taskId)
            .map(t => t.dependsOn === taskId ? { ...t, dependsOn: null } : t)
        };
      }
      return p;
    }));
  };

  // Görev notu ekleme/düzenleme
  const updateTaskNote = (projectId, taskId, newNote) => {
    const now = new Date().toISOString();
    setProjects(projects.map(p => {
      if (p.id === parseInt(projectId)) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
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
  };

  // Görevleri yeniden sıralama (Drag & Drop)
  const reorderTasks = (projectId, newTasksArray) => {
    const now = new Date().toISOString();
    setProjects(projects.map(p => {
      if (p.id === parseInt(projectId)) {
        // Hafta değişikliklerini kontrol et
        const updatedTasks = newTasksArray.map(newTask => {
          const oldTask = p.tasks.find(ot => ot.id === newTask.id);
          if (oldTask && oldTask.week !== newTask.week) {
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

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} deleteProject={deleteProject} archiveProject={archiveProject} resetData={resetData} sendTaskNotification={sendTaskNotification} requestNotificationPermission={requestNotificationPermission} />} />
          <Route path="/create" element={<CreateProject addProject={addProject} resetData={resetData} requestNotificationPermission={requestNotificationPermission} />} />
          <Route path="/project/:id" element={<ProjectDetails projects={projects} addTask={addTask} toggleTask={toggleTask} deleteProject={deleteProject} deleteTask={deleteTask} updateTaskNote={updateTaskNote} reorderTasks={reorderTasks} archiveProject={archiveProject} resetData={resetData} requestNotificationPermission={requestNotificationPermission} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
