import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, Briefcase, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [theme, setTheme] = useState(localStorage.getItem('velopath_theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('velopath_theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    const handleStorageSync = () => {
      setTheme(localStorage.getItem('velopath_theme') || 'dark');
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  return (
    <div className="sidebar" style={{ transition: 'background-color 0.4s ease' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800 }}>VeloPath</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/create" className={`nav-item ${isActive('/create') ? 'active' : ''}`}>
          <PlusCircle size={20} /> Proje Oluştur
        </Link>
        <div style={{ flexGrow: 1 }}></div>

        {/* --- Modern Tema Seçimi Alanı --- */}
        <div style={{ margin: '1rem 0', padding: '0 8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '8px', fontWeight: 600 }}>
            Tema
          </div>
          <div style={{ display: 'flex', background: 'var(--glass-deep, rgba(0,0,0,0.1))', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              onClick={() => {
                setTheme('light');
                localStorage.setItem('velopath_theme', 'light');
                document.body.setAttribute('data-theme', 'light');
              }}
              style={{ 
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', border: 'none', 
                background: theme === 'light' ? 'var(--card-bg)' : 'transparent', 
                color: theme === 'light' ? 'var(--primary)' : 'var(--text-secondary)', 
                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                boxShadow: theme === 'light' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none' 
              }}
              title="Aydınlık Tema"
            >
              <Sun size={18} />
            </button>
            <button 
              onClick={() => {
                setTheme('dark');
                localStorage.setItem('velopath_theme', 'dark');
                document.body.setAttribute('data-theme', 'dark');
              }}
              style={{ 
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', border: 'none', 
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'transparent', 
                color: theme === 'dark' ? 'var(--primary)' : 'var(--text-secondary)', 
                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                boxShadow: theme === 'dark' ? '0 2px 10px rgba(0,0,0,0.3)' : 'none' 
              }}
              title="Karanlık Tema"
            >
              <Moon size={18} />
            </button>
          </div>
        </div>

        <Link to="#" className="nav-item">
          <Settings size={20} /> Ayarlar
        </Link>
        <div className="nav-item" style={{ cursor: 'pointer', marginTop: 'auto' }}>
          <LogOut size={20} /> Çıkış Yap
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
