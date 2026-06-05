import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('E-posta adresi gerekli.'); return; }
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
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

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <CheckCircle size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>E-posta Gönderildi</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {email} adresine sıfırlama linki gönderdik. Gelen kutunuzu kontrol edin (spam klasörünü de kontrol etmeyi unutmayın).
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1rem' }}>
              Link 1 saat gecerlidir.
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Şifremi Unuttum</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Hesabınıza kayıtlı e-posta adresinizi girin, şifre sıfırlama linki gönderelim.
              </p>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>E-posta Adresi</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    style={{ width: '100%', paddingLeft: '38px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="button"
                style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
