import React, { useState } from 'react';
import { X, User, Bell, Trash2, Info, Moon, Sun, CheckCircle, Settings, Edit2, Check, Palette } from 'lucide-react';
import * as api from '../api';

const ACCENT_COLORS = [
  { name: 'Indigo',   value: '#6366f1' },
  { name: 'Violet',   value: '#8b5cf6' },
  { name: 'Pink',     value: '#ec4899' },
  { name: 'Rose',     value: '#f43f5e' },
  { name: 'Orange',   value: '#f97316' },
  { name: 'Amber',    value: '#f59e0b' },
  { name: 'Emerald',  value: '#10b981' },
  { name: 'Cyan',     value: '#06b6d4' },
  { name: 'Sky',      value: '#0ea5e9' },
];

const SettingsModal = ({ isOpen, onClose, username, userId, setUsername, theme, setTheme, accentColor, setAccentColor, requestNotificationPermission, resetData }) => {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  if (!isOpen) return null;

  const handleEditName = () => {
    setNewName(username);
    setNameError('');
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) { setNameError('Ad boş olamaz.'); return; }
    setNameSaving(true);
    setNameError('');
    try {
      const updated = await api.updateUsername(userId, newName.trim());
      setUsername(updated.username);
      localStorage.setItem('velopath_username', updated.username);
      setEditingName(false);
    } catch (err) {
      setNameError(err.response?.data?.error || 'Güncelleme başarısız.');
    } finally {
      setNameSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      setPasswordError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setPasswordSaving(true);
    setPasswordError('');
    try {
      await api.updatePassword(userId, currentPassword.trim(), newPassword.trim());
      setEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      alert('Şifreniz başarıyla güncellendi.');
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Şifre güncellenemedi.');
    } finally {
      setPasswordSaving(false);
    }
  };

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
              <div style={{ flex: 1 }}>
                {editingName ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                        style={{
                          flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--primary)',
                          background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '0.95rem'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={nameSaving}
                        style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#fff' }}
                      >
                        {nameSaving ? '...' : <Check size={16} />}
                      </button>
                      <button
                        onClick={() => setEditingName(false)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {nameError && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--danger)' }}>{nameError}</p>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{username}</p>
                    <button
                      onClick={handleEditName}
                      title="Kullanıcı adını düzenle"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex' }}
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standart Üye</p>
              </div>
            </div>

            {/* Password Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
                <Settings size={20} />
              </div>
              <div style={{ flex: 1 }}>
                {editingPassword ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="password"
                      placeholder="Mevcut Şifre"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      style={{
                        padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--primary)',
                        background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '0.95rem'
                      }}
                    />
                    <input
                      type="password"
                      placeholder="Yeni Şifre"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      style={{
                        padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--primary)',
                        background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '0.95rem'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        onClick={handleSavePassword}
                        disabled={passwordSaving}
                        style={{ flex: 1, background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff' }}
                      >
                        {passwordSaving ? '...' : 'Güncelle'}
                      </button>
                      <button
                        onClick={() => { setEditingPassword(false); setPasswordError(''); setCurrentPassword(''); setNewPassword(''); }}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        Vazgeç
                      </button>
                    </div>
                    {passwordError && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--danger)' }}>{passwordError}</p>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>Şifreyi Değiştir</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hesap güvenliği</p>
                    </div>
                    <button
                      onClick={() => setEditingPassword(true)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    >
                      Değiştir
                    </button>
                  </div>
                )}
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

              {/* Accent Renk Secici */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}><Palette size={15} /> Vurgu Rengi</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Butonlar ve istatistikler için</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '200px' }}>
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setAccentColor(c.value)}
                      title={c.name}
                      style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: c.value, border: 'none', cursor: 'pointer',
                        outline: accentColor === c.value ? '2px solid white' : '2px solid transparent',
                        outlineOffset: '2px',
                        transition: 'outline 0.15s',
                      }}
                    />
                  ))}
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
