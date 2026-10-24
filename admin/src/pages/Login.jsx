import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, getToken, setToken } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@alpha25.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/login', { method: 'POST', body: { email, password } });
      setToken(data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>Admin login</h1>
        <p>Manage lessons, audio, books, worksheets and questions.</p>
        {error && <div className="error">{error}</div>}
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        <div className="form-actions">
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </form>
    </div>
  );
}
