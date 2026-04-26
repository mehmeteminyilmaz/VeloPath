import React, { useState } from 'react';
import { ArrowRight, Lock, User, Eye, EyeOff, UserPlus, LogIn, AlertCircle } from 'lucide-react';

const Login = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = (newMode) => {
    setMode(newMode);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Kullanıcı adı ve şifre boş bırakılamaz.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(username.trim(), password);
      } else {
        await onRegister(username.trim(), password);
      }
    } catch (err) {
      setError(err.message || 'Bir hata oluştu, tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Aurora arka plan efektleri */}
      <div className="aurora-blur" style={{ top: '-10%', left: '-10%', background: 'var(--primary)' }} />
      <div className="aurora-blur" style={{ bottom: '-10%', right: '-10%', background: 'var(--accent)', animationDelay: '-10s' }} />
      <div className="aurora-blur" style={{ top: '30%', left: '40%', background: '#8b5cf6', width: '400px', height: '400px', animationDelay: '-5s' }} />

      <div className="login-card animate-pop">
        {/* Logo */}
        <span className="login-logo">VeloPath</span>
        <p className="login-subtitle">Akıllı Proje Yönetimi ve Verimlilik Asistanı</p>

        {/* Sekme: Giriş / Kayıt */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          {[
            { key: 'login',    label: 'Giriş Yap',  Icon: LogIn },
            { key: 'register', label: 'Kayıt Ol',   Icon: UserPlus }
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => resetForm(key)}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '9px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: mode === key ? 700 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s',
                background: mode === key
                  ? 'linear-gradient(135deg, var(--primary), #8b5cf6)'
                  : 'transparent',
                color: mode === key ? '#fff' : 'var(--text-secondary)',
                boxShadow: mode === key ? '0 4px 15px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Kullanıcı adı */}
          <div className="login-input-group">
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', paddingLeft: '4px' }}>
              Kullanıcı Adı
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="kullanici_adi"
                className="login-input"
                style={{ paddingLeft: '46px' }}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          {/* Şifre */}
          <div className="login-input-group">
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', paddingLeft: '4px' }}>
              Şifre
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="En az 6 karakter"
                className="login-input"
                style={{ paddingLeft: '46px', paddingRight: '46px' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: '4px' }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Şifre Tekrar (sadece kayıt) */}
          {mode === 'register' && (
            <div className="login-input-group animate-slide-up">
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', paddingLeft: '4px' }}>
                Şifre Tekrar
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifreyi tekrar girin"
                  className="login-input"
                  style={{ paddingLeft: '46px' }}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Hata mesajı */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Submit butonu */}
          <button type="submit" className="button login-button" disabled={loading}>
            {loading ? 'Lütfen bekleyin...' : (
              mode === 'login'
                ? <><LogIn size={18} /> Giriş Yap</>
                : <><UserPlus size={18} /> Hesap Oluştur</>
            )}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Alt bilgi */}
        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.6 }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            <Lock size={14} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Verileriniz şifreli olarak güvende saklanır.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
