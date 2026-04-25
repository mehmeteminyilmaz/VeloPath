import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Sun, Moon, Bell, RotateCcw, BarChart2, Monitor, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ resetData, requestNotificationPermission, isSidebarCollapsed, setIsSidebarCollapsed, onLogout }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [theme, setTheme] = useState(localStorage.getItem('velopath_theme') || 'dark');

  const [permissionStatus, setPermissionStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    const handleStorageSync = () => {
      setTheme(localStorage.getItem('velopath_theme') || 'dark');
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  const handleNotificationClick = async () => {
    await requestNotificationPermission();
    if (typeof Notification !== 'undefined') {
      setPermissionStatus(Notification.permission);
    }
  };

  return (
    <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', marginBottom: '2rem' }}>
        {!isSidebarCollapsed && <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>VeloPath</h2>}
        {isSidebarCollapsed && <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>V</h2>}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: '0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          title={isSidebarCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
        >
          {isSidebarCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`} title="Dashboard">
          <LayoutDashboard size={20} /> {!isSidebarCollapsed && <span>Dashboard</span>}
        </Link>
        <Link to="/create" className={`nav-item ${isActive('/create') ? 'active' : ''}`} title="Proje Oluştur">
          <PlusCircle size={20} /> {!isSidebarCollapsed && <span>Proje Oluştur</span>}
        </Link>
        <Link to="/stats" className={`nav-item ${isActive('/stats') ? 'active' : ''}`} title="İstatistikler">
          <BarChart2 size={20} /> {!isSidebarCollapsed && <span>İstatistikler</span>}
        </Link>
        <div style={{ flexGrow: 1 }}></div>

        {/* --- Modern Tema Seçimi Alanı --- */}
        <div style={{ margin: '1rem 0', padding: isSidebarCollapsed ? '0' : '0 8px' }}>
          {!isSidebarCollapsed && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '8px', fontWeight: 600 }}>
              Tema
            </div>
          )}
          <div style={{ 
            display: 'flex', 
            flexDirection: isSidebarCollapsed ? 'column' : 'row',
            background: 'var(--glass-deep, rgba(0,0,0,0.1))', 
            borderRadius: '12px', 
            padding: '4px', 
            border: '1px solid rgba(255,255,255,0.05)',
            gap: isSidebarCollapsed ? '4px' : '0'
          }}>
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


        <Link to="#" className="nav-item" title="Ayarlar">
          <Settings size={20} /> {!isSidebarCollapsed && <span>Ayarlar</span>}
        </Link>


        <div className="nav-item" style={{ cursor: 'pointer', marginTop: 'auto' }} title="Çıkış Yap" onClick={onLogout}>
          <LogOut size={20} /> {!isSidebarCollapsed && <span>Çıkış Yap</span>}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
