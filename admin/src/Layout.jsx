import { NavLink, useNavigate } from 'react-router-dom';
import { api, setToken } from './api';

const links = [
  ['/', 'Dashboard'],
  ['/classes', 'Classes'],
  ['/audio', 'Audio'],
  ['/ebooks', 'eBooks'],
  ['/worksheets', 'Worksheets'],
  ['/gk', 'GK'],
  ['/spoken-english', 'Spoken English'],
  ['/phonics', 'Phonics'],
];

export default function Layout({ children }) {
  const navigate = useNavigate();

  async function logout() {
    try { await api('/logout', { method: 'POST' }); } catch { /* token may already be gone */ }
    setToken(null);
    navigate('/login');
  }

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">Alpha 25 Admin</div>
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
        ))}
        <button className="btn secondary logout" type="button" onClick={logout}>Log out</button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
