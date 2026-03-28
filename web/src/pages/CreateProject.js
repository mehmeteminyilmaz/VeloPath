import React from 'react';
import { LayoutDashboard, PlusCircle, Briefcase, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-layout">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>VeloPath</h2>
        <nav>
          <Link to="/" className="nav-item"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/create-project" className="nav-item active"><PlusCircle size={20} /> Proje Oluştur</Link>
          <Link to="#" className="nav-item"><Briefcase size={20} /> Projelerim</Link>
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
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>Yeni Proje Başlat</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Projenin detaylarını belirleyerek hedefine bir adım daha yaklaş.</p>
        </header>

        <section style={{ maxWidth: '600px' }}>
          <div className="card">
            <div className="input-group">
              <label>Proje Başlığı</label>
              <input type="text" placeholder="Örn: VeloPath Web Geliştirme" />
            </div>
            <div className="input-group">
              <label>Açıklama</label>
              <textarea placeholder="Proje hakkında kısa bilgi..." rows="4" style={{ resize: 'none' }}></textarea>
            </div>
            <button className="button" style={{ width: '100%', justifyContent: 'center' }}>
              Proje Oluştur
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CreateProject;
