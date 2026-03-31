import React, { useState } from 'react';
import { ArrowLeft, Monitor, Smartphone, Layers, LayoutTemplate, XCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { PROJECT_TEMPLATES } from '../data/templates';

const iconMap = {
  Monitor: Monitor,
  Smartphone: Smartphone,
  Layers: Layers
};

const CreateProject = ({ addProject }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Orta');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Devam Ediyor');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#6366f1'); // Default Indigo
  
  const colors = [
    { name: 'Indigo', code: '#6366f1' },
    { name: 'Emerald', code: '#10b981' },
    { name: 'Amber', code: '#f59e0b' },
    { name: 'Rose', code: '#f43f5e' },
    { name: 'Cyan', code: '#06b6d4' },
    { name: 'Violet', code: '#8b5cf6' },
    { name: 'Blue', code: '#3b82f6' },
    { name: 'Slate', code: '#64748b' }
  ];
  
  const navigate = useNavigate();

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setTitle(template.title);
    setDescription(template.description);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      const template = PROJECT_TEMPLATES.find(t => t.id === selectedTemplate);
      
      let initialTasks = [];
      if (template) {
        // Derin klonlama ve ID yenileme işlemi (Robust Cloning)
        const idMapping = {};
        template.tasks.forEach((task, index) => {
           idMapping[task.id] = index + 1; // yepyeni 1, 2, 3... ID'ler
        });

        initialTasks = template.tasks.map((task) => ({
          ...task,
          id: idMapping[task.id],
          dependsOn: task.dependsOn ? idMapping[task.dependsOn] : null
        }));
      }

      addProject({ title, description, priority, deadline, status, color: selectedColor, initialTasks });
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
          {/* Şablon Seçimi */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '1rem', fontSize: '0.9rem' }}>Bir Şablonla Hızlan (Opsiyonel)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              
              {/* Boş Şablon Seçeneği */}
              <div 
                  onClick={() => handleTemplateSelect({ id: null, title: '', description: '' })}
                  style={{ 
                    padding: '16px', 
                    background: selectedTemplate === null ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${selectedTemplate === null ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                >
                  <XCircle size={28} color={selectedTemplate === null ? 'var(--primary)' : 'var(--text-secondary)'} style={{ marginBottom: '8px' }} />
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '4px' }}>Boş Proje</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Sıfırdan Başla</p>
              </div>

              {PROJECT_TEMPLATES.map(template => {
                const IconComponent = iconMap[template.icon] || LayoutTemplate;
                return (
                <div 
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  style={{ 
                    padding: '16px', 
                    background: selectedTemplate === template.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${selectedTemplate === template.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                >
                  <IconComponent size={28} color={selectedTemplate === template.id ? 'var(--primary)' : 'var(--text-secondary)'} style={{ marginBottom: '8px' }} />
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '4px' }}>{template.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{template.tasks.length} Hazır Görev</p>
                </div>
              )})}
            </div>
            
            {/* Görev Önizleme Paneli */}
            {selectedTemplate && (
              <div className="animate-slide-up" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                 <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} color="var(--primary)" /> Bu şablon ile otomatik eklenecek görevler:
                 </h4>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {PROJECT_TEMPLATES.find(t => t.id === selectedTemplate)?.tasks.map((task, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{idx + 1}.</span> {task.text}
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>

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
                  className="glass-input"
                >
                  <option value="Düşük">Düşük</option>
                  <option value="Orta">Orta</option>
                  <option value="Yüksek">Yüksek</option>
                </select>
              </div>

              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Teslim Tarihi</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.8 }}>(İsteğe Bağlı)</span>
                </label>
                <input 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Proje Durumu</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="glass-input"
                style={{ marginBottom: '1.5rem' }}
              >
                <option value="Başlangıç">Başlangıç</option>
                <option value="Devam Ediyor">Devam Ediyor</option>
                <option value="Beklemede">Beklemede</option>
                <option value="Tamamlandı">Tamamlandı</option>
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label>Proje Rengi</label>
              <div className="color-picker-container">
                {colors.map(color => (
                  <div 
                    key={color.code}
                    className={`color-option ${selectedColor === color.code ? 'selected' : ''}`}
                    style={{ backgroundColor: color.code }}
                    onClick={() => setSelectedColor(color.code)}
                    title={color.name}
                  />
                ))}
              </div>
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
