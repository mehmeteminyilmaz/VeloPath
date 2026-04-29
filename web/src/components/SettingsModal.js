import React from 'react';
import { X, User, Bell, Trash2, Info, Moon, Sun, CheckCircle, Settings } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, username, theme, setTheme, requestNotificationPermission, resetData }) => {
  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm('Tüm verileriniz silinecek ve oturumunuz kapatılacak. Emin misiniz?')) {
      resetData();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content settings-modal animate-scale-up" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '500px', width: '90%', padding: '0', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ 
          padding: '1.5rem 2rem', 
          borderBottom: '1px solid rgba(255,255,255,0.05)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={20} className="text-gradient" /> Ayarlar
          </h2>
          <button onClick={onClose} className="close-btn" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '8px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Profile Section */}
          <section>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} /> Profil
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {username ? username[0].toUpperCase() : 'U'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{username}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standart Üye</p>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={14} /> Tercihler
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Masaüstü Bildirimleri</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Önemli hatırlatıcıları kaçırmayın</p>
                </div>
                <button 
                  onClick={requestNotificationPermission}
                  className="button-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  İzin İste
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Görünüm Teması</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Karanlık veya aydınlık mod</p>
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
                  <button 
                    onClick={() => setTheme('light')}
                    style={{ padding: '6px', border: 'none', background: theme === 'light' ? 'var(--primary)' : 'transparent', color: theme === 'light' ? 'white' : 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <Sun size={16} />
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    style={{ padding: '6px', border: 'none', background: theme === 'dark' ? 'var(--primary)' : 'transparent', color: theme === 'dark' ? 'white' : 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <Moon size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={14} /> Tehlikeli Bölge
            </h3>
            <button 
              onClick={handleReset}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '12px', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                background: 'rgba(239, 68, 68, 0.05)', 
                color: 'var(--danger)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: '0.2s',
                fontWeight: 600
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; }}
            >
              <Trash2 size={18} /> Tüm Verileri Temizle ve Çıkış Yap
            </button>
          </section>

        </div>

        {/* Footer */}
        <div style={{ 
          padding: '1.5rem 2rem', 
          background: 'rgba(255,255,255,0.02)', 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <Info size={14} /> VeloPath v2.4.0
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-done)', fontSize: '0.8rem', fontWeight: 600 }}>
            <CheckCircle size={14} /> Tüm sistemler çalışıyor
          </div>
        </div>
      </div>
    </div>
  );
};


export default SettingsModal;
