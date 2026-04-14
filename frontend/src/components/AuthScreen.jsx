import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', email: '', identifier: '', password: '' });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.identifier, form.password);
      } else {
        await register({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal autentikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-top">
          <div className="sidebar-logo auth-logo"><i className="fas fa-music" /><span>MyMusic</span></div>
          <h1>{mode === 'login' ? 'Masuk' : 'Daftar'}</h1>
          <p className="subtitle auth-subtitle">{mode === 'login' ? 'Masuk untuk kelola musik kamu' : 'Buat akun baru untuk upload lagu dan album'}</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <>
              <label className="auth-label">Nama lengkap</label>
              <div className="auth-input-wrap">
                <i className="far fa-user" />
                <input placeholder="Masukkan nama lengkap" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
              </div>

              <label className="auth-label">Username</label>
              <div className="auth-input-wrap">
                <i className="fas fa-at" />
                <input placeholder="Masukkan username" value={form.username} onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} required />
              </div>

              <label className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <i className="far fa-envelope" />
                <input type="email" placeholder="Masukkan email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
              </div>
            </>
          )}
          {mode === 'login' && (
            <>
              <label className="auth-label">Username atau email</label>
              <div className="auth-input-wrap">
                <i className="far fa-user" />
                <input
                  placeholder="Masukkan username atau email"
                  value={form.identifier}
                  onChange={(e) => setForm((s) => ({ ...s, identifier: e.target.value }))}
                  required
                />
              </div>
            </>
          )}

          <label className="auth-label">Password</label>
          <div className="auth-input-wrap">
            <i className="fas fa-lock" />
            <input
              type="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
          </div>

          {error ? <p className="auth-error">{error}</p> : null}
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>
        <button className="auth-switch" onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}>
          {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </button>
      </div>
    </div>
  );
}
