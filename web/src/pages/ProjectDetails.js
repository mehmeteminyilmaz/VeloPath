import React, { useState } from 'react';
import { PlusCircle, ArrowLeft, Activity, Trash2, Sparkles, Archive, ArchiveRestore } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import WeeklyPlan from '../components/WeeklyPlan';
const ProjectDetails = ({ projects, addTask, toggleTask, deleteProject, deleteTask, updateTaskNote, reorderTasks, archiveProject }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === parseInt(id));
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskWeek, setNewTaskWeek] = useState(1);
  const [newTaskDependsOn, setNewTaskDependsOn] = useState('');

  if (!project) {
    return (
      <div className="auth-layout">
        <Sidebar />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--text-primary)' }}>Proje Bulunamadı</h1>
            <Link to="/" className="button" style={{ marginTop: '2rem' }}>Dashboard'a Dön</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(id, newTaskText, parseInt(newTaskWeek), newTaskDependsOn ? parseInt(newTaskDependsOn) : null);
      setNewTaskText('');
      setNewTaskDependsOn('');
    }
  };

  const completedCount = project.tasks.filter(t => t.completed).length;
  const totalCount = project.tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Renk belirleyici fonksiyon
  const getStatusColor = (prog) => {
    if (prog === 100) return 'var(--status-done)';
    if (prog > 70) return 'var(--status-high)';
    if (prog > 30) return 'var(--status-mid)';
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
                 onClick={() => archiveProject(project.id)}
                 style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.3s', marginTop: '8px' }}
                 title={project.archived ? "Arşivden Çıkar" : "Arşivle"}
               >
                 {project.archived ? <><ArchiveRestore size={16} /> Geri Yükle</> : <><Archive size={16} /> Arşivle</>}
               </button>
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

        <section className="animate-slide-up delay-100" style={{ maxWidth: '900px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="var(--primary)" />
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>Görev Dağılımı</h2>
            </div>
            <button 
              onClick={() => alert('Yapay Zeka (AI) entegrasyonu Backend aşamasında (Hafta 5 ve Sonrası) aktif edilecektir! 🚀')} 
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', border: 'none', padding: '8px 16px', borderRadius: '20px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Sparkles size={16} /> AI ile Planı Optimize Et
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <WeeklyPlan project={project} toggleTask={toggleTask} deleteTask={deleteTask} updateTaskNote={updateTaskNote} reorderTasks={reorderTasks} />
          </div>
          
          <form className="card" onSubmit={handleAddTask} style={{ marginTop: '3rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1rem' }}>Yeni Görev Planla</h4>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
              <input 
                type="text" 
                placeholder="Görev adı..." 
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="glass-input"
                style={{ flex: 2 }}
              />
              <input 
                type="number" 
                min="1"
                placeholder="Hafta No (Örn: 1)"
                value={newTaskWeek}
                onChange={(e) => setNewTaskWeek(e.target.value)}
                className="glass-input"
                style={{ flex: 0.5 }}
                title="Hangi haftaya ekleneceğini belirleyin"
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select 
                value={newTaskDependsOn}
                onChange={(e) => setNewTaskDependsOn(e.target.value)}
                className="glass-input"
                style={{ flex: 1 }}
              >
                <option value="">Bağımlılık Yok</option>
                {project.tasks.map(t => <option key={t.id} value={t.id}>Bağımlı: {t.text}</option>)}
              </select>
              <button type="submit" className="button" style={{ padding: '12px 24px' }}>
                <PlusCircle size={20} /> Ekle
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};


export default ProjectDetails;
