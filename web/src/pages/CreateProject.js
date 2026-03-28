import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

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
      <Sidebar />

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
