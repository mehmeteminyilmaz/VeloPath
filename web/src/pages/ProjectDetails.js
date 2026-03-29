import React, { useState } from 'react';
import { PlusCircle, ArrowLeft, CheckCircle, Circle, Activity, Trash2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const ProjectDetails = ({ projects, addTask, toggleTask, deleteProject, deleteTask }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === parseInt(id));
  const [newTaskText, setNewTaskText] = useState('');

  if (!project) {
    return (
      <div className="auth-layout">
        <Sidebar />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'white' }}>Proje Bulunamadı</h1>
            <Link to="/" className="button" style={{ marginTop: '2rem' }}>Dashboard'a Dön</Link>
          </div>
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

  // Renk belirleyici fonksiyon
  const getStatusColor = (progress) => {
    if (progress === 100) return 'var(--status-done)';
    if (progress > 70) return 'var(--status-high)';
    if (progress > 30) return 'var(--status-mid)';
    return 'var(--status-low)';
  };

  const statusColor = getStatusColor(progress);

  return (
    <div className="auth-layout">
      <Sidebar />

      <main className="main-content">
        <header className="animate-slide-up" style={{ marginBottom: '3rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Dashboard'a Dön
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{project.title}</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{project.description}</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                  {project.priority && (
                    <span style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: project.priority === 'Yüksek' ? 'var(--danger)' : project.priority === 'Orta' ? 'var(--status-low)' : 'var(--status-mid)', border: '1px solid currentColor' }}>
                      🔥 {project.priority} Öncelik
                    </span>
                  )}
                  {project.deadline && (
                    <span style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      📅 Teslim: {project.deadline}
                    </span>
                  )}
                </div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <span className="status-badge" style={{ color: statusColor, padding: '8px 16px', fontSize: '0.8rem', marginTop: '8px' }}>
                  {project.status ? project.status.toUpperCase() : (progress === 100 ? 'TAMAMLANDI' : 'DEVAM EDİYOR')}
               </span>
               <button
                 onClick={() => {
                   if(window.confirm('Bu projeyi tamamen silmek istediğinize emin misiniz?')) {
                     deleteProject(project.id);
                     navigate('/');
                   }
                 }}
                 style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '8px', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.3s', marginTop: '8px' }}
               >
                 <Trash2 size={16} /> Sil
               </button>
             </div>
          </div>
          
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Genel İlerleme</span>
              <span style={{ color: statusColor, fontWeight: 'bold' }}>%{progress}</span>
            </div>
            <div className="progress-bar" style={{ height: '14px', borderRadius: '7px' }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: statusColor }}></div>
            </div>
          </div>
        </header>

        <section className="animate-slide-up delay-100" style={{ maxWidth: '800px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
              <Activity size={20} color="var(--primary)" />
              <h3 style={{ color: 'white' }}>Görevler ({completedCount} / {totalCount})</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {project.tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', marginTop: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <Activity size={32} color="var(--primary)" />
                  </div>
                  <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Harika Bir Başlangıç!</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Görünüşe göre bu proje için henüz bir adım planlamadınız. Yeni bir görev ekleyerek hedeflerinize ulaşmaya başlayın.</p>
                </div>
              ) : (
                project.tasks.map(task => (
                  <div 
                    key={task.id} 
                    className="task-item" 
                    onClick={() => toggleTask(id, task.id)} 
                    style={{ 
                      cursor: 'pointer', 
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      borderBottom: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {task.completed ? <CheckCircle size={20} color="var(--accent)" /> : <Circle size={20} color="var(--text-secondary)" />}
                    <span style={{ 
                      color: task.completed ? 'var(--text-secondary)' : 'white', 
                      textDecoration: task.completed ? 'line-through' : 'none',
                      fontSize: '1rem',
                      flex: 1
                    }}>
                      {task.text}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(id, task.id);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', opacity: 0.6 }}
                      title="Görevi Sil"
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddTask} style={{ marginTop: '2.5rem', display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Yeni bir görev ekleyin..." 
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                style={{ 
                  flex: 1, 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: 'white'
                }}
              />
              <button type="submit" className="button" style={{ padding: '12px 16px' }}>
                <PlusCircle size={20} /> Ekle
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectDetails;
