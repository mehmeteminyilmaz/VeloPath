import React, { useState } from 'react';
import { ArrowLeft, Monitor, Smartphone, Layers, LayoutGrid, XCircle, CheckCircle, Code2, GraduationCap, Briefcase, Heart, Star, TrendingUp, Palette, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { PROJECT_TEMPLATES, TEMPLATE_CATEGORIES } from '../data/templates';

const iconMap = {
  Monitor, Smartphone, Layers,
  Code2, GraduationCap, Briefcase, Heart, Star, TrendingUp, Palette, Home, LayoutGrid
};

const CreateProject = ({ addProject, resetData, requestNotificationPermission, setIsSidebarCollapsed, isSidebarCollapsed, onLogout, toggleSettings }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Orta');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Devam Ediyor');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [activeCategory, setActiveCategory] = useState('all');

  const colors = [
    { name: 'Indigo',   code: '#6366f1' },
    { name: 'Emerald',  code: '#10b981' },
    { name: 'Amber',    code: '#f59e0b' },
    { name: 'Rose',     code: '#f43f5e' },
    { name: 'Cyan',     code: '#06b6d4' },
    { name: 'Violet',   code: '#8b5cf6' },
    { name: 'Blue',     code: '#3b82f6' },
    { name: 'Slate',    code: '#64748b' },
  ];

  const navigate = useNavigate();

  const filteredTemplates = activeCategory === 'all'
    ? PROJECT_TEMPLATES
    : PROJECT_TEMPLATES.filter(t => t.category === activeCategory);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setTitle(template.title);
    setDescription(template.description);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (deadline) {
      const year = new Date(deadline).getFullYear();
      if (year < 2020 || year > 2100 || isNaN(year)) {
        alert('Lütfen geçerli bir teslim tarihi seçin (Yıl 2020 ile 2100 arasında olmalıdır).');
        return;
      }
    }

    const template = PROJECT_TEMPLATES.find(t => t.id === selectedTemplate);
    let initialTasks = [];
    if (template) {
      const idMapping = {};
      template.tasks.forEach((task, index) => { idMapping[task.id] = index + 1; });
      initialTasks = template.tasks.map((task) => ({
        ...task,
        id: idMapping[task.id],
        dependsOn: task.dependsOn ? idMapping[task.dependsOn] : null
      }));
    }

    addProject({ title, description, priority, deadline, status, color: selectedColor, initialTasks });
    navigate('/');
  };

  const selectedTemplateData = PROJECT_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="auth-layout">
      <Sidebar resetData={resetData} requestNotificationPermission={requestNotificationPermission} setIsSidebarCollapsed={setIsSidebarCollapsed} isSidebarCollapsed={isSidebarCollapsed} onLogout={onLogout} toggleSettings={toggleSettings} />

      <main className="main-content" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '780px', padding: '1rem 0' }}>
          <header className="animate-slide-up" style={{ marginBottom: '3rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem', width: 'fit-content' }}>
              <ArrowLeft size={16} /> Dashboard'a Dön
            </Link>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Yeni Proje Başlat</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Hazır şablonlardan birini seç veya sıfırdan başla. Projeye göre özelleştir.</p>
          </header>

          <section className="animate-slide-up delay-100">

            {/* ── Şablon Seçimi ── */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
                Bir Şablonla Hızlan <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(İsteğe Bağlı)</span>
              </label>

              {/* Kategori Filtreleri */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {TEMPLATE_CATEGORIES.map(cat => {
                  const Icon = iconMap[cat.icon] || LayoutGrid;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                        background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: isActive ? '#fff' : 'var(--text-secondary)',
                        transition: '0.2s', whiteSpace: 'nowrap',
                      }}
                    >
                      <Icon size={13} /> {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Boş Proje + Şablon Kartları */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>

                {/* Boş Proje */}
                {activeCategory === 'all' && (
                  <div
                    onClick={() => { setSelectedTemplate(null); setTitle(''); setDescription(''); }}
                    style={{
                      padding: '16px', background: selectedTemplate === null ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${selectedTemplate === null ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '14px', cursor: 'pointer', transition: '0.2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '110px',
                    }}
                  >
                    <XCircle size={26} color={selectedTemplate === null ? 'var(--primary)' : 'var(--text-secondary)'} style={{ marginBottom: '8px' }} />
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '0.82rem', marginBottom: '4px' }}>Boş Proje</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Sıfırdan Başla</p>
                  </div>
                )}

                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    style={{
                      padding: '16px', background: selectedTemplate === template.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${selectedTemplate === template.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '14px', cursor: 'pointer', transition: '0.2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '110px',
                    }}
                  >
                    <span style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{template.emoji}</span>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '0.82rem', marginBottom: '4px', lineHeight: 1.3 }}>{template.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>{template.tasks.length} Hazır Görev</p>
                  </div>
                ))}
              </div>

              {/* Görev Önizleme */}
              {selectedTemplateData && (
                <div className="animate-slide-up" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(99,102,241,0.05)', borderRadius: '14px', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} color="var(--primary)" /> {selectedTemplateData.emoji} {selectedTemplateData.title} — Bu şablonla projeye otomatik eklenecek görevler:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {selectedTemplateData.tasks.map((task, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.83rem', color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', flexShrink: 0 }}>{idx + 1}.</span>
                        <span>{task.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Form ── */}
            <form className="card" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Proje Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: YKS Hazırlık, Fitness Planı, YouTube Kanalı..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Açıklama</label>
                <textarea
                  placeholder="Proje hakkında kısa bilgi..."
                  rows="3"
                  style={{ resize: 'none' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Öncelik Seviyesi</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="glass-input">
                    <option value="Düşük">Düşük</option>
                    <option value="Orta">Orta</option>
                    <option value="Yüksek">Yüksek</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Teslim Tarihi</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'normal' }}>(İsteğe Bağlı)</span>
                  </label>
                  <input type="date" value={deadline} min={new Date().toISOString().split('T')[0]} max="2100-12-31" onChange={(e) => setDeadline(e.target.value)} className="glass-input" />
                </div>
              </div>

              <div className="input-group">
                <label>Proje Durumu</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="glass-input" style={{ marginBottom: '1.5rem' }}>
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
                Projeyi Kaydet ve Başlat 🚀
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
