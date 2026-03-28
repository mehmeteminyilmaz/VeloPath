import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, Briefcase, Settings, LogOut, ArrowLeft, CheckCircle, Circle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const ProjectDetails = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([
    { id: 1, text: "React Router Kurulumu", completed: true },
    { id: 2, text: "Dashboard Tasarımı", completed: true },
    { id: 3, text: "API Entegrasyonu", completed: false }
  ]);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
  };

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  return (
    <div className="auth-layout">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>VeloPath</h2>
        <nav>
          <Link to="/" className="nav-item"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/create-project" className="nav-item"><PlusCircle size={20} /> Proje Oluştur</Link>
          <Link to="#" className="nav-item active"><Briefcase size={20} /> Projelerim</Link>
          <div style={{ flexGrow: 1 }}></div>
          <Link to="#" className="nav-item"><Settings size={20} /> Ayarlar</Link>
          <Link to="#" className="nav-item"><LogOut size={20} /> Çıkış Yap</Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ marginBottom: '3rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Dashboard'a Dön
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>VeloPath Web</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Mevcut İlerleme: {progress}%</p>
          <div className="progress-bar" style={{ height: '12px', marginTop: '1rem' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </header>

        <section className="grid">
          <div className="card">
            <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Görev Listesi</h3>
            <div>
              {tasks.map(task => (
                <div key={task.id} className="task-item" onClick={() => toggleTask(task.id)} style={{ cursor: 'pointer' }}>
                  {task.completed ? <CheckCircle size={20} color="var(--accent)" /> : <Circle size={20} color="var(--text-secondary)" />}
                  <span style={{ color: task.completed ? 'var(--text-secondary)' : 'white' }}>{task.text}</span>
                </div>
              ))}
            </div>
            <div className="input-group" style={{ marginTop: '2rem' }}>
              <input type="text" placeholder="Yeni görev ekle..." />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectDetails;
