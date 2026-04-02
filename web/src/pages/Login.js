import React, { useState } from 'react';
import { ArrowRight, Lock, User } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="login-page">
      {/* Premium Aurora Background Effects */}
      <div className="aurora-blur" style={{ top: '-10%', left: '-10%', background: 'var(--primary)' }}></div>
      <div className="aurora-blur" style={{ bottom: '-10%', right: '-10%', background: 'var(--accent)', animationDelay: '-10s' }}></div>
      <div className="aurora-blur" style={{ top: '30%', left: '40%', background: '#8b5cf6', width: '400px', height: '400px', animationDelay: '-5s' }}></div>

      <div className="login-card animate-pop">
        <span className="login-logo">VeloPath</span>
        <p className="login-subtitle">Akıllı Proje Yönetimi ve Verimlilik Asistanı</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', paddingLeft: '4px' }}>
              İsminiz nedir?
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Örn: Mehmet"
                className="login-input"
                style={{ paddingLeft: '46px' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <button type="submit" className="button login-button">
            Hadi Başlayalım <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.6 }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            <Lock size={14} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Verileriniz yerel olarak saklanır.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
