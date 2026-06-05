import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    if (password !== confirm) { setError('Şifreler eşleşmedi.'); return; }
    if (!token) { setError('Geçersiz sıfırlama linki.'); return; }
    setLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Bir hata oluştu. Link süresi dolmuş olabilir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={15} /> Girişe Dön
        </Link>

        {done ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <CheckCircle size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Şifre Güncellendi!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Yeni Şifre Belirle</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>En az 6 karakter uzunluğunda bir şifre seçin.</p>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {!token && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                Geçersiz sıfırlama linki. Lütfen tekrar şifre sıfırlama talebinde bulunun.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Yeni Şifre</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px', paddingTop: '10px', paddingBottom: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Şifre Tekrar</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Şifreyi tekrar girin"
                    style={{ width: '100%', paddingLeft: '38px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="button"
                style={{ width: '100%', justifyContent: 'center', opacity: (loading || !token) ? 0.7 : 1, marginTop: '0.5rem' }}
              >
                {loading ? 'Kaydediliyor...' : 'Şifremi Güncelle'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
