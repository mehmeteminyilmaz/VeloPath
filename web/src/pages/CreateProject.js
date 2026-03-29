import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CreateProject = ({ addProject }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Orta');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Devam Ediyor');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      addProject({ title, description, priority, deadline, status });
      navigate('/');
    }
  };

  return (
    <div className="auth-layout">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <header className="animate-slide-up" style={{ marginBottom: '3rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Dashboard'a Dön
          </Link>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Yeni Proje Başlat</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Projenin detaylarını belirleyerek hedefine bir adım daha yaklaş.</p>
        </header>

        <section className="animate-slide-up delay-100" style={{ maxWidth: '600px' }}>
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
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Öncelik Seviyesi</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '1rem', WebkitAppearance: 'none' }}
                >
                  <option value="Düşük">Düşük</option>
                  <option value="Orta">Orta</option>
                  <option value="Yüksek">Yüksek</option>
                </select>
              </div>

              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Teslim Tarihi (Deadline)</label>
                <input 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Proje Durumu</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '1rem', WebkitAppearance: 'none', marginBottom: '1.5rem' }}
              >
                <option value="Başlangıç">Başlangıç</option>
                <option value="Devam Ediyor">Devam Ediyor</option>
                <option value="Beklemede">Beklemede</option>
                <option value="Tamamlandı">Tamamlandı</option>
              </select>
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
