import React from 'react';
import { LayoutDashboard, PlusCircle, Briefcase, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>VeloPath</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/create" className={`nav-item ${isActive('/create') ? 'active' : ''}`}>
          <PlusCircle size={20} /> Proje Oluştur
        </Link>
        <Link to="#" className="nav-item">
          <Briefcase size={20} /> Projelerim
        </Link>
        
        {/* Ayarlar ve Çıkış Yap'ı aşağı itmek için boşluk bırakıyoruz */}
        <div style={{ flexGrow: 1 }}></div>

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
