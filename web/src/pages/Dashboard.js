import React from 'react';
import { PlusCircle, Briefcase, CheckCircle, Activity, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Dashboard = ({ projects }) => {
  // İstatistikleri hesaplayalım
  const stats = {
    total: projects.length,
    activeTasks: projects.reduce((acc, p) => acc + p.tasks.filter(t => !t.completed).length, 0),
    completed: projects.filter(p => p.tasks.length > 0 && p.tasks.every(t => t.completed)).length
  };

  // İlerleme durumuna göre renk ve etiket belirleyen fonksiyon
  const getProgressInfo = (progress) => {
    if (progress === 100) return { color: 'var(--status-done)', label: 'Tamamlandı', glow: true };
    if (progress > 70) return { color: 'var(--status-high)', label: 'Final Yakın', glow: false };
    if (progress > 30) return { color: 'var(--status-mid)', label: 'İlerliyor', glow: false };
    return { color: 'var(--status-low)', label: 'Başlangıç', glow: false };
  };

  return (
    <div className="auth-layout">
      <Sidebar />

      <main className="main-content">
        <header className="animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>Kontrol Paneli</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Hoş Geldin, Mehmet! Bugün neler yapıyoruz?</p>
          </div>
          <Link to="/create" className="button">
            <PlusCircle size={20} />
            Yeni Proje Oluştur
          </Link>
        </header>

        {/* İstatistik Kartları */}
        <section className="stats-container animate-slide-up delay-100">
          <div className="stat-card">
            <div className="stat-icon"><Briefcase size={24} /></div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Toplam Proje</p>
              <h3 style={{ color: 'white', fontSize: '1.5rem' }}>{stats.total}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)' }}><Activity size={24} /></div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Bekleyen Görevler</p>
              <h3 style={{ color: 'white', fontSize: '1.5rem' }}>{stats.activeTasks}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--status-done)' }}><CheckCircle size={24} /></div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tamamlananlar</p>
              <h3 style={{ color: 'white', fontSize: '1.5rem' }}>{stats.completed}</h3>
            </div>
          </div>
        </section>

        <h2 className="animate-slide-up delay-200" style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layout size={20} color="var(--primary)" /> Projelerim
        </h2>

        <section className="grid animate-slide-up delay-300">
          {projects.length === 0 ? (
            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Henüz bir projeniz yok. İlkini oluşturmaya ne dersiniz?</p>
            </div>
          ) : (
            projects.map(project => {
              const completedTasks = project.tasks.filter(t => t.completed).length;
              const totalTasks = project.tasks.length;
              const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
              const info = getProgressInfo(progress);

              return (
                <Link 
                  key={project.id} 
                  to={`/project/${project.id}`} 
                  className={`card ${info.glow ? 'glow-card' : ''}`} 
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1.1rem' }}>{project.title}</h3>
                    <span className="status-badge" style={{ color: info.color }}>{project.status || info.label}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                    {project.priority && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: project.priority === 'Yüksek' ? 'var(--danger)' : project.priority === 'Orta' ? 'var(--status-low)' : 'var(--status-mid)' }}>
                        {project.priority} Öncelik
                      </span>
                    )}
                    {project.deadline && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                        Son: {project.deadline}
                      </span>
                    )}
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    {completedTasks} / {totalTasks} Görev Tamamlandı
                  </p>
                  
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%`, background: info.color }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <p style={{ fontSize: '0.8rem', color: info.color, fontWeight: 'bold' }}>%{progress}</p>
                  </div>
                </Link>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
