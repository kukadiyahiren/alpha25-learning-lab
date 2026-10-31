import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('admin-menu-open', menuOpen);
    return () => document.body.classList.remove('admin-menu-open');
  }, [menuOpen]);

  async function logout() {
    try { await api('/logout', { method: 'POST' }); } catch { /* token may already be gone */ }
    setToken(null);
    navigate('/login');
  }

  return (
    <div className={`shell${menuOpen ? ' menu-open' : ''}`}>
      <header className="mobile-bar">
        <button
          className={`menu-toggle${menuOpen ? ' open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span /><span />
        </button>
        <div className="mobile-brand">Alpha 25 Admin</div>
      </header>

      <div className="side-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />

      <aside className="side">
        <div className="brand">Alpha 25 Admin</div>
        <nav className="side-nav" aria-label="Admin">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
          ))}
        </nav>
        <button className="btn secondary logout" type="button" onClick={logout}>Log out</button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
