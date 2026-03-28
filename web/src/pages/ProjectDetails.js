import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, Briefcase, Settings, LogOut, ArrowLeft, CheckCircle, Circle, Save } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const ProjectDetails = ({ projects, addTask, toggleTask }) => {
  const { id } = useParams();
  const project = projects.find(p => p.id === parseInt(id));
  const [newTaskText, setNewTaskText] = useState('');

  if (!project) {
    return (
      <div className="auth-layout">
        <div className="main-content" style={{ margin: 'auto', textAlign: 'center' }}>
          <h1 style={{ color: 'white' }}>Proje Bulunamadı</h1>
          <Link to="/" className="button" style={{ marginTop: '2rem' }}>Dashboard'a Dön</Link>
        </div>
      </div>
    );
  }

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(id, newTaskText);
      setNewTaskText('');
    }
  };

  const completedCount = project.tasks.filter(t => t.completed).length;
  const totalCount = project.tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="auth-layout">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>VeloPath</h2>
        <nav>
          <Link to="/" className="nav-item"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/create" className="nav-item"><PlusCircle size={20} /> Proje Oluştur</Link>
          <Link to="#" className="nav-item active"><Briefcase size={20} /> Projelerim</Link>
          <div style={{ flexGrow: 1 }}></div>
          <Link to="#" className="nav-item"><Settings size={20} /> Ayarlar</Link>
          <div className="nav-item" style={{ cursor: 'pointer' }}><LogOut size={20} /> Çıkış Yap</div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ marginBottom: '3rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Dashboard'a Dön
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>{project.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{project.description}</p>
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>İlerleme Durumu</span>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>%{progress}</span>
            </div>
            <div className="progress-bar" style={{ height: '12px' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </header>

        <section className="grid">
          <div className="card">
            <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Görevler ({completedCount}/{totalCount})</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {project.tasks.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Henüz görev eklenmemiş.</p>
              ) : (
                project.tasks.map(task => (
                  <div 
                    key={task.id} 
                    className="task-item" 
                    onClick={() => toggleTask(id, task.id)} 
                    style={{ cursor: 'pointer' }}
                  >
                    {task.completed ? <CheckCircle size={20} color="var(--accent)" /> : <Circle size={20} color="var(--text-secondary)" />}
                    <span style={{ color: task.completed ? 'var(--text-secondary)' : 'white', textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.text}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddTask} className="input-group" style={{ marginTop: '2rem', display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Yeni bir görev ekleyin..." 
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="button" style={{ padding: '12px' }}>
                <PlusCircle size={20} />
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectDetails;
