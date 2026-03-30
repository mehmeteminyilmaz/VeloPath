import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import './styles/App.css';

function App() {
  // Global State: İlk yüklemede LocalStorage'dan kontrol et
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('velopath_projects');
    if (savedProjects) {
      return JSON.parse(savedProjects);
    }
    // Yoksa varsayılan datayı döndür
    return [
      { 
        id: 1, 
        title: "VeloPath Web Geliştirme", 
        description: "React ile ana kontrol paneli oluşturma.",
        priority: "Yüksek",
        deadline: "2026-04-15",
        status: "Devam Ediyor",
        tasks: [
          { id: 1, text: "React Router Kurulumu", completed: true, week: 1, dependsOn: null },
          { id: 2, text: "Dashboard Tasarımı", completed: true, week: 1, dependsOn: 1 },
          { id: 3, text: "State Management Entegrasyonu", completed: false, week: 2, dependsOn: 2 }
        ] 
      }
    ];
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
      id: projects.length + 1, 
      tasks: initialTasks 
    }]);
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
          <Route path="/" element={<Dashboard projects={projects} deleteProject={deleteProject} />} />
          <Route path="/create" element={<CreateProject addProject={addProject} />} />
          <Route path="/project/:id" element={<ProjectDetails projects={projects} addTask={addTask} toggleTask={toggleTask} deleteProject={deleteProject} deleteTask={deleteTask} updateTaskNote={updateTaskNote} reorderTasks={reorderTasks} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
