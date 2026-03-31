import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import './styles/App.css';

function App() {
  // Global State: İlk yüklemede LocalStorage'dan kontrol et
  const [projects, setProjects] = useState(() => {
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
          { id: 1, text: "React Router Kurulumu", completed: true, week: 1, dependsOn: null },
          { id: 2, text: "Dashboard Tasarımı", completed: true, week: 1, dependsOn: 1 },
          { id: 3, text: "State Management Entegrasyonu", completed: false, week: 2, dependsOn: 2 }
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
          { id: 1, text: "Port Scanner Geliştirme", completed: true, week: 1, dependsOn: null },
          { id: 2, text: "Network Sniffer Modülü", completed: true, week: 2, dependsOn: 1 }
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
          { id: 1, text: "Sesli Not Özelliği", completed: true, week: 1, dependsOn: null },
          { id: 2, text: "AI Chat Entegrasyonu", completed: true, week: 2, dependsOn: 1 }
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
          { id: 1, text: "Firebase Veritabanı Kurulumu", completed: true, week: 1, dependsOn: null },
          { id: 2, text: "Bitki Takibi Arayüzü", completed: true, week: 1, dependsOn: 1 }
        ]
      }
    ];

    const savedProjects = localStorage.getItem('velopath_projects');
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects);
      // Eğer kullanıcıda hiç proje yoksa veya yeni örnekleri eklemek istiyorsak:
      // Burada sadece eksik olan "cybersec", "gunce", "TarimAsistan" gibi projeleri ekleyebiliriz.
      const existingTitles = parsed.map(p => p.title);
      const missingSamples = defaultProjects.filter(p => !existingTitles.includes(p.title));
      
      if (missingSamples.length > 0) {
        return [...parsed, ...missingSamples];
      }
      return parsed;
    }
    return defaultProjects;
  });

  // Projeler değiştiğinde localStorage'a kaydet
  React.useEffect(() => {
    localStorage.setItem('velopath_projects', JSON.stringify(projects));
  }, [projects]);

  // Tema yükleme
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('velopath_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

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
        return {
          ...p,
          tasks: [...p.tasks, { id: nextId, text: taskText, completed: false, week, dependsOn }]
        };
      }
      return p;
    }));
  };

  // Görev durumu değiştirme
  const toggleTask = (projectId, taskId) => {
    setProjects(projects.map(p => {
      if (p.id === parseInt(projectId)) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
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
    setProjects(projects.map(p => {
      if (p.id === parseInt(projectId)) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, notes: newNote } : t)
        };
      }
      return p;
    }));
  };

  // Görevleri yeniden sıralama (Drag & Drop)
  const reorderTasks = (projectId, newTasksArray) => {
    setProjects(projects.map(p => {
      if (p.id === parseInt(projectId)) {
        return { ...p, tasks: newTasksArray };
      }
      return p;
    }));
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} deleteProject={deleteProject} archiveProject={archiveProject} />} />
          <Route path="/create" element={<CreateProject addProject={addProject} />} />
          <Route path="/project/:id" element={<ProjectDetails projects={projects} addTask={addTask} toggleTask={toggleTask} deleteProject={deleteProject} deleteTask={deleteTask} updateTaskNote={updateTaskNote} reorderTasks={reorderTasks} archiveProject={archiveProject} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
