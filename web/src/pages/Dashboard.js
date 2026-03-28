import React from 'react';
import { LayoutDashboard, PlusCircle, Briefcase, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const projects = [
    { id: 1, title: "VeloPath Web", progress: 30, tasks: [1, 2, 3] },
    { id: 2, title: "VeloPath Mobile", progress: 10, tasks: [1] },
    { id: 3, title: "Backend API", progress: 0, tasks: [] }
  ];

  return (
    <div className="auth-layout">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>VeloPath</h2>
        <nav>
          <Link to="/" className="nav-item active"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/create-project" className="nav-item"><PlusCircle size={20} /> Proje Oluştur</Link>
          <Link to="#" className="nav-item"><Briefcase size={20} /> Projelerim</Link>
          <div style={{ flexGrow: 1 }}></div>
          <Link to="#" className="nav-item"><Settings size={20} /> Ayarlar</Link>
          <Link to="#" className="nav-item"><LogOut size={20} /> Çıkış Yap</Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Hoş Geldin, Mehmet! Bugün neler yapıyoruz?</p>
          </div>
          <Link to="/create-project" className="button">
            <PlusCircle size={20} />
            Yeni Proje Oluştur
          </Link>
        </header>

        <section className="grid">
          {projects.map(project => (
            <Link key={project.id} to={`/project/${project.id}`} className="card" style={{ textDecoration: 'none' }}>
              <h3 style={{ marginBottom: '1rem', color: 'white' }}>{project.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{project.tasks.length} Görev Tamamlandı</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
              </div>
              <p style={{ marginTop: '8px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--accent)' }}>%{project.progress}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
