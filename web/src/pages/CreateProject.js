import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, Briefcase, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CreateProject = ({ addProject }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      addProject({ title, description });
      navigate('/');
    }
  };

  return (
    <div className="auth-layout">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>VeloPath</h2>
        <nav>
          <Link to="/" className="nav-item"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/create" className="nav-item active"><PlusCircle size={20} /> Proje Oluştur</Link>
          <Link to="#" className="nav-item"><Briefcase size={20} /> Projelerim</Link>
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
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>Yeni Proje Başlat</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Projenin detaylarını belirleyerek hedefine bir adım daha yaklaş.</p>
        </header>

        <section style={{ maxWidth: '600px' }}>
          <form className="card" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Proje Başlığı</label>
              <input 
                type="text" 
                placeholder="Örn: VeloPath Web Geliştirme" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
              />
            </div>
            <div className="input-group">
              <label>Açıklama</label>
              <textarea 
                placeholder="Proje hakkında kısa bilgi..." 
                rows="4" 
                style={{ resize: 'none' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="button" style={{ width: '100%', justifyContent: 'center' }}>
              Projeyi Kaydet ve Başlat
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CreateProject;
