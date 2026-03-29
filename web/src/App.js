import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import './styles/App.css';

function App() {
  // Global State: Projeleri ve görevlerini burada tutuyoruz
  const [projects, setProjects] = useState([
    { 
      id: 1, 
      title: "VeloPath Web Geliştirme", 
      description: "React ile ana kontrol paneli oluşturma.",
      priority: "Yüksek",
      deadline: "2026-04-15",
      status: "Devam Ediyor",
      tasks: [
        { id: 1, text: "React Router Kurulumu", completed: true },
        { id: 2, text: "Dashboard Tasarımı", completed: true },
        { id: 3, text: "State Management Entegrasyonu", completed: false }
      ] 
    }
  ]);

  // Yeni proje ekleme fonksiyonu
  const addProject = (newProject) => {
    setProjects([...projects, { ...newProject, id: projects.length + 1, tasks: [] }]);
  };

  // Görev ekleme fonksiyonu
  const addTask = (projectId, taskText) => {
    setProjects(projects.map(p => {
      if (p.id === parseInt(projectId)) {
        return {
          ...p,
          tasks: [...p.tasks, { id: p.tasks.length + 1, text: taskText, completed: false }]
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

  return (
    <Router>
      <div className="App">
        <div className="aurora-bg"></div>
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} />} />
          <Route path="/create" element={<CreateProject addProject={addProject} />} />
          <Route path="/project/:id" element={<ProjectDetails projects={projects} addTask={addTask} toggleTask={toggleTask} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
