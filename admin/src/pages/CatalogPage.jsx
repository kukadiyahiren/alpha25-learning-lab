import { useEffect, useMemo, useState } from 'react';
import { api, downloadFile } from '../api';
import { RESOURCES } from '../catalog';

const emptyOptions = () => ['', '', '', ''];

const emptyFrom = (fields) => Object.fromEntries(fields.map((field) => [
  field.name,
  field.type === 'options' ? emptyOptions() : '',
]));

function optionsFromRow(value) {
  const list = Array.isArray(value) ? value.map((item) => String(item ?? '')) : [];
  while (list.length < 4) list.push('');
  return list;
}

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
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkError, setBulkError] = useState('');

  async function load() {
    const data = await api(`/admin/${resource}`);
    setRows(data);
  }

  useEffect(() => {
    setForm(emptyFrom(config.fields));
    setFiles({});
    setEditing(null);
    setError('');
    setMessage('');
    setBulkFile(null);
    setBulkMessage('');
    setBulkError('');
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
      if (field.type === 'file') return;
      if (field.type === 'options') {
        next[field.name] = optionsFromRow(row[field.name]);
        return;
      }
      next[field.name] = row[field.name] ?? '';
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

  function updateOption(fieldName, index, value) {
    const current = Array.isArray(form[fieldName]) ? [...form[fieldName]] : emptyOptions();
    current[index] = value;
    setForm({ ...form, [fieldName]: current });
  }

  function addOption(fieldName) {
    const current = Array.isArray(form[fieldName]) ? [...form[fieldName]] : emptyOptions();
    if (current.length >= 8) return;
    setForm({ ...form, [fieldName]: [...current, ''] });
  }

  function removeOption(fieldName, index) {
    const current = Array.isArray(form[fieldName]) ? [...form[fieldName]] : emptyOptions();
    if (current.length <= 2) {
      current[index] = '';
      setForm({ ...form, [fieldName]: current });
      return;
    }
    current.splice(index, 1);
    setForm({ ...form, [fieldName]: current });
  }

  function useOptionAsAnswer(value) {
    if (!value.trim()) return;
    setForm({ ...form, answer: value.trim() });
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      for (const field of config.fields) {
        if (field.type !== 'file') continue;
        const chosen = files[field.name];
        if (field.required && !editing && !chosen) {
          throw Object.assign(new Error(`Please choose a ${field.label.toLowerCase()}.`), { errors: {} });
        }
        if (chosen && field.maxMb && chosen.size > field.maxMb * 1024 * 1024) {
          throw Object.assign(new Error(`${field.label} must be under ${field.maxMb} MB.`), { errors: {} });
        }
        if (chosen && field.name === 'file') {
          const name = String(chosen.name || '').toLowerCase();
          if (!name.endsWith('.pdf')) {
            throw Object.assign(new Error('Book file must be a PDF (.pdf).'), { errors: {} });
          }
        }
      }

      const data = new FormData();
      config.fields.forEach((field) => {
        if (field.type === 'file') {
          if (files[field.name]) data.append(field.name, files[field.name]);
          return;
        }
        if (field.type === 'options') {
          const options = (Array.isArray(form[field.name]) ? form[field.name] : [])
            .map((item) => String(item ?? '').trim())
            .filter(Boolean);
          data.append('options_present', '1');
          options.forEach((option, index) => data.append(`options[${index}]`, option));
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
      const messages = Object.values(err.errors || {}).flat().filter(Boolean);
      setError(messages.join(' ') || err.message || 'Could not save. Try a smaller PDF.');
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

  async function downloadSample(type) {
    if (!config.bulk) return;
    setBulkError('');
    try {
      const base = config.bulk.sample.replace(/\.csv$/, '');
      if (type === 'xlsx') {
        await downloadFile(`/admin/${resource}/import-template.xlsx`, `${base}.xlsx`);
      } else {
        await downloadFile(`/admin/${resource}/import-template.csv`, `${base}.csv`);
      }
    } catch (err) {
      setBulkError(err.message);
    }
  }

  async function importBulk(event) {
    event.preventDefault();
    if (!bulkFile) {
      setBulkError('Choose a CSV or Excel file first.');
      return;
    }
    setBulkBusy(true);
    setBulkError('');
    setBulkMessage('');
    try {
      const data = new FormData();
      data.append('file', bulkFile);
      const result = await api(`/admin/${resource}/import`, { method: 'POST', formData: data });
      const extra = result.errors?.length ? ` ${result.errors.join(' ')}` : '';
      setBulkMessage(`${result.message}${extra}`);
      setBulkFile(null);
      event.target.reset();
      await load();
    } catch (err) {
      const first = Object.values(err.errors || {})[0];
      setBulkError(first?.[0] || err.message);
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div>
      <div className="top">
        <h1>{config.title}</h1>
        <p>{config.hint}</p>
      </div>

      {config.bulk && (
        <section className="panel bulk-panel">
          <h2>Bulk upload</h2>
          <p className="muted">
            Download the sample sheet, fill one row per item, then upload the CSV or Excel file.
            Columns: {config.bulk.columns.map((column) => <code key={column} style={{ marginRight: 6 }}>{column}</code>)}
            {config.bulk.note ? ` ${config.bulk.note}` : ''}
          </p>
          <div className="form-actions">
            <button className="btn secondary" type="button" onClick={() => downloadSample('xlsx')}>Download Excel sample</button>
            <button className="btn secondary" type="button" onClick={() => downloadSample('csv')}>Download CSV sample</button>
            <a className="btn secondary" href={`/${config.bulk.sample}`} download>Local CSV sample</a>
          </div>
          <form onSubmit={importBulk} style={{ marginTop: 12 }}>
            {bulkError && <div className="error">{bulkError}</div>}
            {bulkMessage && <div className="ok">{bulkMessage}</div>}
            <label htmlFor="bulk-file">CSV or Excel file</label>
            <input
              id="bulk-file"
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
            />
            <div className="form-actions">
              <button className="btn" type="submit" disabled={bulkBusy}>{bulkBusy ? 'Importing…' : 'Upload sheet'}</button>
            </div>
          </form>
        </section>
      )}

      <div className="layout-split">
        <form className="panel" onSubmit={save}>
          <h2>{editing ? 'Edit' : 'Add'}</h2>
          {error && <div className="error">{error}</div>}
          {message && <div className="ok">{message}</div>}
          {config.fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.type === 'options' ? undefined : field.name}>{field.label}</label>
              {field.hint && <p className="muted" style={{ margin: '0 0 8px' }}>{field.hint}</p>}
              {field.type === 'textarea' ? (
                <textarea id={field.name} required={field.required} placeholder={field.placeholder || ''} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
              ) : field.type === 'file' ? (
                <>
                  <input
                    id={field.name}
                    type="file"
                    accept={field.accept}
                    required={Boolean(field.required) && !editing}
                    onChange={(e) => {
                      const chosen = e.target.files?.[0] || null;
                      setFiles({ ...files, [field.name]: chosen });
                      setError('');
                    }}
                  />
                  {files[field.name] && (
                    <p className="muted" style={{ margin: '6px 0 0' }}>
                      Selected: {files[field.name].name}
                      {files[field.name].size ? ` (${Math.max(1, Math.round(files[field.name].size / 1024))} KB)` : ''}
                    </p>
                  )}
                  {editing && field.name === 'file' && !files.file && (
                    <p className="muted" style={{ margin: '6px 0 0' }}>Leave empty to keep the current PDF.</p>
                  )}
                </>
              ) : field.type === 'options' ? (
                <div className="options-editor">
                  {(Array.isArray(form[field.name]) ? form[field.name] : emptyOptions()).map((option, index) => (
                    <div className="option-row" key={`${field.name}-${index}`}>
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <input
                        type="text"
                        aria-label={`Option ${String.fromCharCode(65 + index)}`}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => updateOption(field.name, index, e.target.value)}
                      />
                      <button className="btn secondary small" type="button" onClick={() => useOptionAsAnswer(option)} title="Set as correct answer">Correct</button>
                      <button className="btn danger small" type="button" onClick={() => removeOption(field.name, index)} aria-label="Remove option">×</button>
                    </div>
                  ))}
                  {(Array.isArray(form[field.name]) ? form[field.name] : []).length < 8 && (
                    <button className="btn secondary small" type="button" onClick={() => addOption(field.name)}>+ Add option</button>
                  )}
                </div>
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
