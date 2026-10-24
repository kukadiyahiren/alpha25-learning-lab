import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { RESOURCES } from '../catalog';

const emptyFrom = (fields) => Object.fromEntries(fields.map((field) => [field.name, '']));

export default function CatalogPage({ resource }) {
  const config = RESOURCES[resource];
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyFrom(config.fields));
  const [files, setFiles] = useState({});
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api(`/admin/${resource}`);
    setRows(data);
  }

  useEffect(() => {
    setForm(emptyFrom(config.fields));
    setFiles({});
    setEditing(null);
    setError('');
    load().catch((err) => setError(err.message));
  }, [resource]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [rows, query]);

  function edit(row) {
    const next = emptyFrom(config.fields);
    config.fields.forEach((field) => {
      if (field.type !== 'file') next[field.name] = row[field.name] ?? '';
    });
    setForm(next);
    setFiles({});
    setEditing(row.id);
    setMessage('');
    setError('');
  }

  function reset() {
    setForm(emptyFrom(config.fields));
    setFiles({});
    setEditing(null);
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      config.fields.forEach((field) => {
        if (field.type === 'file') {
          if (files[field.name]) data.append(field.name, files[field.name]);
          return;
        }
        if (field.type === 'number' && form[field.name] === '') return;
        data.append(field.name, form[field.name] ?? '');
      });
      if (editing) await api(`/admin/${resource}/${editing}`, { method: 'POST', formData: data });
      else await api(`/admin/${resource}`, { method: 'POST', formData: data });
      setMessage(editing ? 'Updated.' : 'Added.');
      reset();
      await load();
    } catch (err) {
      const first = Object.values(err.errors || {})[0];
      setError(first?.[0] || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(row) {
    if (!window.confirm(`Delete "${row.title || row.question || row.topic || row.letter}"?`)) return;
    try {
      await api(`/admin/${resource}/${row.id}`, { method: 'DELETE' });
      if (editing === row.id) reset();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="top">
        <h1>{config.title}</h1>
        <p>{config.hint}</p>
      </div>
      <div className="layout-split">
        <form className="panel" onSubmit={save}>
          <h2>{editing ? 'Edit' : 'Add'}</h2>
          {error && <div className="error">{error}</div>}
          {message && <div className="ok">{message}</div>}
          {config.fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea id={field.name} required={field.required} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
              ) : field.type === 'file' ? (
                <input id={field.name} type="file" accept={field.accept} onChange={(e) => setFiles({ ...files, [field.name]: e.target.files?.[0] })} />
              ) : (
                <input id={field.name} type={field.type === 'number' ? 'number' : 'text'} required={field.required} placeholder={field.placeholder || ''} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
              )}
            </div>
          ))}
          <div className="form-actions">
            <button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Update' : 'Add'}</button>
            {editing && <button className="btn secondary" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
        <div className="table-wrap">
          <div style={{ padding: 16 }}>
            <input className="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
          </div>
          <table>
            <thead>
              <tr>
                {config.columns.map((column) => <th key={column}>{column}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  {config.columns.map((column) => <td key={column}>{String(row[column] ?? '')}</td>)}
                  <td>
                    <div className="row-actions">
                      <button className="btn secondary small" type="button" onClick={() => edit(row)}>Edit</button>
                      <button className="btn danger small" type="button" onClick={() => remove(row)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={config.columns.length + 1} className="muted">Nothing here yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
