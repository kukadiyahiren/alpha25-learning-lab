import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const cards = [
  ['grades', 'Classes', '/classes'],
  ['audio', 'Audio stories', '/audio'],
  ['ebooks', 'eBooks', '/ebooks'],
  ['worksheets', 'Worksheets', '/worksheets'],
  ['gk', 'GK questions', '/gk'],
  ['spoken', 'Spoken English', '/spoken-english'],
  ['phonics', 'Phonics', '/phonics'],
  ['questions', 'Class questions', '/classes'],
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats').then(setStats).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <div className="top">
        <h1>Dashboard</h1>
        <p>What you add here is what students see on the learning site.</p>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="stats">
        {cards.map(([key, label, to]) => (
          <Link className="stat" key={key} to={to}>
            <b>{stats ? stats[key] : '—'}</b>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
