import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { downloadCsvSample, downloadExcelSample } from '../sampleDownload';

const BULK_COLUMNS = [
  'grade', 'subject', 'title', 'description', 'marks', 'time_label', 'icon', 'sort_order',
  'section', 'type', 'question', 'option_1', 'option_2', 'option_3', 'option_4',
  'answer_index', 'answer_text',
];

const BULK_SAMPLES = [
  ['3', 'math', 'ધોરણ-૩ ગણિત સત્ર વર્કશીટ', 'Satra practice', 10, '40 મિનિટ', '🧮', 0, '૧. ખાલી જગ્યા', 'fill', '૪૫ + ૫૪ = ____', '', '', '', '', 0, '99'],
  ['3', 'math', 'ધોરણ-૩ ગણિત સત્ર વર્કશીટ', 'Satra practice', 10, '40 મિનિટ', '🧮', 0, '૨. સાચું-ખોટું', 'true_false', '5 પછી 6 આવે છે.', 'સાચું', 'ખોટું', '', '', 0, ''],
  ['3', 'math', 'ધોરણ-૩ ગણિત સત્ર વર્કશીટ', 'Satra practice', 10, '40 મિનિટ', '🧮', 0, '૩. યોગ્ય વિકલ્પ', 'mcq', '૩૫ - ____ = ૨૦', '૩૩', '૧૫', '૫૫', '', 1, ''],
  ['3', 'math', 'ધોરણ-૩ ગણિત સત્ર વર્કશીટ', 'Satra practice', 10, '40 મિનિટ', '🧮', 0, '૪. જવાબ લખો', 'short', '૫૨ + ૧૨ = ?', '', '', '', '', 0, '64'],
];

const emptyQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  answer_index: 0,
  type: 'mcq',
  section: '',
  answer_text: '',
  meta: { hour: 3, minute: 0, left: '', answers: '' },
});

const emptyForm = () => ({
  grade: '3',
  subject: 'math',
  title: '',
  description: '',
  marks: 20,
  time_label: '40 મિનિટ',
  icon: '🧮',
  sort_order: 0,
  questions: [emptyQuestion()],
});

function parseMatchMeta(item) {
  const left = String(item.meta?.left || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const answers = {};
  String(item.meta?.answers || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [l, r] = line.split('=').map((part) => part.trim());
      if (l && r) answers[l] = r;
    });
  return { left, answers };
}

export default function Worksheet2Page() {
  const [meta, setMeta] = useState({ standards: [], subjects: [], question_types: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [openQ, setOpenQ] = useState(0);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [tab, setTab] = useState('sheets');
  const [attempts, setAttempts] = useState([]);
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [attemptQuery, setAttemptQuery] = useState('');

  const subjectMap = useMemo(
    () => Object.fromEntries((meta.subjects || []).map((item) => [item.id, item])),
    [meta.subjects],
  );

  async function load() {
    const [metaData, list] = await Promise.all([
      api('/worksheet2/meta'),
      api('/admin/worksheet2'),
    ]);
    setMeta(metaData);
    setRows(list);
  }

  async function loadAttempts() {
    const list = await api(`/admin/worksheet2/attempts${attemptQuery ? `?q=${encodeURIComponent(attemptQuery)}` : ''}`);
    setAttempts(list);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (tab !== 'attempts') return;
    loadAttempts().catch((err) => setError(err.message));
  }, [tab]);

  function closeEditor() {
    setEditorOpen(false);
    setForm(emptyForm());
    setEditing(null);
    setOpenQ(0);
    setError('');
    setMessage('');
  }

  function startAdd() {
    setForm(emptyForm());
    setEditing(null);
    setOpenQ(0);
    setError('');
    setMessage('');
    setEditorOpen(true);
  }

  async function edit(row) {
    setError('');
    setMessage('');
    try {
      const full = await api(`/admin/worksheet2/${row.id}`);
      setEditing(full.id);
      setForm({
        grade: String(full.grade || '1'),
        subject: full.subject || 'gujarati',
        title: full.title || '',
        description: full.description || '',
        marks: full.marks || 20,
        time_label: full.time_label || '20 મિનિટ',
        icon: full.icon || '📝',
        sort_order: full.sort_order || 0,
        questions: (full.questions || []).map((q) => {
          const options = Array.isArray(q.options) ? [...q.options] : ['', '', '', ''];
          while (options.length < 4) options.push('');
          const left = (q.meta?.left || []).join('\n');
          const answers = Object.entries(q.meta?.answers || {})
            .map(([k, v]) => `${k}=${v}`)
            .join('\n');
          return {
            type: q.type || 'mcq',
            section: q.section || '',
            question: q.question || '',
            options: options.slice(0, 4),
            answer_index: Number(q.answer_index) || 0,
            answer_text: q.answer_text || '',
            meta: {
              hour: q.meta?.hour ?? 3,
              minute: q.meta?.minute ?? 0,
              left,
              answers,
            },
          };
        }),
      });
      setOpenQ(0);
      setTab('sheets');
      setEditorOpen(true);
    } catch (err) {
      setError(err.message);
    }
  }

  function updateQuestion(index, patch) {
    setForm((prev) => {
      const questions = prev.questions.map((item, i) => (i === index ? { ...item, ...patch } : item));
      return { ...prev, questions };
    });
  }

  function updateOption(qIndex, oIndex, value) {
    setForm((prev) => {
      const questions = prev.questions.map((item, i) => {
        if (i !== qIndex) return item;
        const options = [...item.options];
        options[oIndex] = value;
        return { ...item, options };
      });
      return { ...prev, questions };
    });
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        ...form,
        marks: Number(form.marks) || form.questions.length,
        sort_order: Number(form.sort_order) || 0,
        questions: form.questions.map((item, index) => {
          const type = item.type || 'mcq';
          let metaPayload;
          if (type === 'clock') {
            metaPayload = { hour: Number(item.meta?.hour) || 3, minute: Number(item.meta?.minute) || 0 };
          } else if (type === 'match') {
            metaPayload = parseMatchMeta(item);
          }
          return {
            type,
            section: item.section || null,
            question: item.question,
            options: item.options,
            answer_index: Number(item.answer_index) || 0,
            answer_text: item.answer_text || null,
            meta: metaPayload,
            sort_order: index,
          };
        }),
      };
      if (editing) await api(`/admin/worksheet2/${editing}`, { method: 'POST', body: payload });
      else await api('/admin/worksheet2', { method: 'POST', body: payload });
      setMessage(editing ? 'Updated.' : 'Added.');
      await load();
      closeEditor();
    } catch (err) {
      const messages = Object.values(err.errors || {}).flat().filter(Boolean);
      setError(messages.join(' ') || err.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(row) {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    try {
      await api(`/admin/worksheet2/${row.id}`, { method: 'DELETE' });
      if (editing === row.id) closeEditor();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function downloadSample(type) {
    setBulkError('');
    try {
      if (type === 'xlsx') {
        downloadExcelSample('worksheet2-sample.xls', BULK_COLUMNS, BULK_SAMPLES, 'Worksheets');
      } else {
        downloadCsvSample('worksheet2-sample.csv', BULK_COLUMNS, BULK_SAMPLES);
      }
    } catch (err) {
      setBulkError(err.message || 'Could not download the sample file.');
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
      const result = await api('/admin/worksheet2/import', { method: 'POST', formData: data });
      const extra = result.errors?.length ? ` ${result.errors.slice(0, 5).join(' ')}` : '';
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

  async function openAttempt(row) {
    try {
      const detail = await api(`/admin/worksheet2/attempts/${row.id}`);
      setAttemptDetail(detail);
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = rows.filter((row) => {
    const hay = `${row.grade} ${row.subject} ${row.title} ${row.description || ''}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  const questionTypes = meta.question_types?.length
    ? meta.question_types
    : [
      { id: 'mcq', label: 'MCQ' },
      { id: 'fill', label: 'Fill' },
      { id: 'true_false', label: 'True/False' },
      { id: 'short', label: 'Short' },
      { id: 'sequence', label: 'Sequence' },
      { id: 'clock', label: 'Clock' },
      { id: 'match', label: 'Match' },
    ];

  return (
    <div className="ws-admin">
      <div className="top ws-top">
        <div>
          <h1>Worksheets</h1>
          <p>Satra practice papers · answers saved on submit</p>
        </div>
        <div className="ws-toolbar">
          <button type="button" className={`btn ${tab === 'sheets' ? '' : 'secondary'}`} onClick={() => setTab('sheets')}>
            Sheets
          </button>
          <button type="button" className={`btn ${tab === 'attempts' ? '' : 'secondary'}`} onClick={() => setTab('attempts')}>
            Answers
          </button>
          {tab === 'sheets' && (
            <button type="button" className="btn" onClick={startAdd}>+ Add</button>
          )}
        </div>
      </div>

      {tab === 'attempts' ? (
        <section className="panel ws-panel">
          {error && <div className="error">{error}</div>}
          <div className="ws-inline-bar">
            <input
              value={attemptQuery}
              onChange={(e) => setAttemptQuery(e.target.value)}
              placeholder="Search name / grade"
            />
            <button type="button" className="btn secondary" onClick={() => loadAttempts().catch((err) => setError(err.message))}>
              Refresh
            </button>
          </div>
          <div className="table-wrap ws-table">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Student</th>
                  <th>Std</th>
                  <th>Sheet</th>
                  <th>Score</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {attempts.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.created_at).toLocaleString()}</td>
                    <td>{row.student_name}</td>
                    <td>{row.grade}</td>
                    <td>{row.sheet?.title || `#${row.sheet_id}`}</td>
                    <td>{row.score}/{row.total}</td>
                    <td>
                      <button type="button" className="btn secondary" onClick={() => openAttempt(row)}>View</button>
                    </td>
                  </tr>
                ))}
                {!attempts.length && (
                  <tr><td colSpan={6}>No attempts yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {attemptDetail && (
            <div className="ws-drawer-backdrop" onClick={() => setAttemptDetail(null)}>
              <div className="ws-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="ws-drawer-head">
                  <div>
                    <strong>{attemptDetail.student_name}</strong>
                    <div className="muted">{attemptDetail.sheet?.title} · {attemptDetail.score}/{attemptDetail.total} ({attemptDetail.percent}%)</div>
                  </div>
                  <button type="button" className="btn secondary" onClick={() => setAttemptDetail(null)}>Close</button>
                </div>
                <ul className="ws-answer-list">
                  {(attemptDetail.answers || []).map((answer) => (
                    <li key={answer.id}>
                      {answer.is_correct ? '✅' : '❌'}{' '}
                      {answer.question?.question || `Q#${answer.question_id}`}
                      {answer.answer_text ? ` → ${answer.answer_text}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
          <details className="panel ws-panel ws-bulk">
            <summary>Bulk upload (CSV / Excel)</summary>
            <p className="muted ws-bulk-hint">
              One row = one question. Same grade + subject + title = one paper. Types: mcq, fill, true_false, short, sequence.
            </p>
            <div className="ws-inline-bar">
              <button className="btn secondary" type="button" onClick={() => downloadSample('xlsx')}>Excel sample</button>
              <button className="btn secondary" type="button" onClick={() => downloadSample('csv')}>CSV sample</button>
            </div>
            <form onSubmit={importBulk} className="ws-bulk-form">
              {bulkError && <div className="error">{bulkError}</div>}
              {bulkMessage && <div className="ok">{bulkMessage}</div>}
              <input
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              />
              <button className="btn" type="submit" disabled={bulkBusy}>{bulkBusy ? 'Importing…' : 'Upload'}</button>
            </form>
          </details>

          <section className="panel ws-panel">
            {error && !editorOpen && <div className="error">{error}</div>}
            {message && !editorOpen && <div className="ok">{message}</div>}
            <div className="ws-inline-bar">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search worksheets…"
              />
              <span className="muted">{filtered.length} sheets</span>
            </div>
            <div className="table-wrap ws-table">
              <table>
                <thead>
                  <tr>
                    <th>Std</th>
                    <th>Subject</th>
                    <th>Title</th>
                    <th>Q</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td>{row.grade}</td>
                      <td>{subjectMap[row.subject]?.name || row.subject}</td>
                      <td>{row.title}</td>
                      <td>{row.question_count ?? row.questions_count ?? '—'}</td>
                      <td className="row-actions">
                        <button type="button" className="btn secondary" onClick={() => edit(row)}>Edit</button>
                        <button type="button" className="btn secondary" onClick={() => remove(row)}>Del</button>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr><td colSpan={5}>No worksheets yet. Click + Add or use Bulk upload.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {editorOpen && (
        <div className="ws-drawer-backdrop" onClick={closeEditor}>
          <div className="ws-drawer ws-editor" onClick={(e) => e.stopPropagation()}>
            <div className="ws-drawer-head">
              <strong>{editing ? 'Edit worksheet' : 'Add worksheet'}</strong>
              <button type="button" className="btn secondary" onClick={closeEditor}>Close</button>
            </div>
            {error && <div className="error">{error}</div>}
            <form onSubmit={save} className="ws-editor-form">
              <div className="ws-meta-grid">
                <label>
                  Std
                  <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} required>
                    {(meta.standards.length ? meta.standards : [{ id: '1', name: 'ધોરણ 1' }]).map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Subject
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
                    {(meta.subjects.length ? meta.subjects : [{ id: 'gujarati', name: 'Gujarati' }]).map((item) => (
                      <option key={item.id} value={item.id}>{item.icon || ''} {item.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Marks
                  <input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} />
                </label>
                <label>
                  Time
                  <input value={form.time_label} onChange={(e) => setForm({ ...form, time_label: e.target.value })} />
                </label>
                <label className="ws-span-2">
                  Title
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </label>
                <label className="ws-span-2">
                  Description
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </label>
              </div>

              <div className="ws-q-head">
                <strong>Questions ({form.questions.length})</strong>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }));
                    setOpenQ(form.questions.length);
                  }}
                >
                  + Q
                </button>
              </div>

              <div className="ws-q-list">
                {form.questions.map((item, index) => {
                  const expanded = openQ === index;
                  const preview = item.question?.trim() || 'Empty question';
                  return (
                    <div key={index} className={`ws-q-card${expanded ? ' open' : ''}`}>
                      <button
                        type="button"
                        className="ws-q-summary"
                        onClick={() => setOpenQ(expanded ? -1 : index)}
                      >
                        <span>Q{index + 1}</span>
                        <span className="ws-q-type">{item.type || 'mcq'}</span>
                        <span className="ws-q-preview">{item.section ? `${item.section} · ` : ''}{preview}</span>
                        <span className="ws-q-chevron">{expanded ? '▾' : '▸'}</span>
                      </button>
                      {expanded && (
                        <div className="ws-q-body">
                          <div className="ws-meta-grid">
                            <label>
                              Type
                              <select
                                value={item.type || 'mcq'}
                                onChange={(e) => updateQuestion(index, { type: e.target.value })}
                              >
                                {questionTypes.map((t) => (
                                  <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Section
                              <input
                                value={item.section || ''}
                                onChange={(e) => updateQuestion(index, { section: e.target.value })}
                                placeholder="૧. ખાલી જગ્યા"
                              />
                            </label>
                          </div>
                          <label>
                            Question
                            <input
                              value={item.question}
                              onChange={(e) => updateQuestion(index, { question: e.target.value })}
                              required
                            />
                          </label>

                          {['fill', 'short', 'sequence'].includes(item.type) && (
                            <label>
                              Answer
                              <input
                                value={item.answer_text || ''}
                                onChange={(e) => updateQuestion(index, { answer_text: e.target.value })}
                                required
                              />
                            </label>
                          )}

                          {item.type === 'clock' && (
                            <div className="ws-meta-grid">
                              <label>
                                Hour
                                <input
                                  type="number"
                                  min={1}
                                  max={12}
                                  value={item.meta?.hour ?? 3}
                                  onChange={(e) => updateQuestion(index, { meta: { ...item.meta, hour: e.target.value } })}
                                />
                              </label>
                              <label>
                                Minute
                                <input
                                  type="number"
                                  min={0}
                                  max={59}
                                  value={item.meta?.minute ?? 0}
                                  onChange={(e) => updateQuestion(index, { meta: { ...item.meta, minute: e.target.value } })}
                                />
                              </label>
                            </div>
                          )}

                          {item.type === 'match' && (
                            <>
                              <div className="ws-opts-row">
                                {item.options.slice(0, 3).map((option, oIndex) => (
                                  <input
                                    key={oIndex}
                                    value={option}
                                    placeholder={`Right ${oIndex + 1}`}
                                    onChange={(e) => updateOption(index, oIndex, e.target.value)}
                                  />
                                ))}
                              </div>
                              <label>
                                Left (one/line)
                                <textarea
                                  rows={2}
                                  value={item.meta?.left || ''}
                                  onChange={(e) => updateQuestion(index, { meta: { ...item.meta, left: e.target.value } })}
                                />
                              </label>
                              <label>
                                Answers left=right
                                <textarea
                                  rows={2}
                                  value={item.meta?.answers || ''}
                                  onChange={(e) => updateQuestion(index, { meta: { ...item.meta, answers: e.target.value } })}
                                />
                              </label>
                            </>
                          )}

                          {['mcq', 'true_false'].includes(item.type || 'mcq') && (
                            <>
                              <div className="ws-opts-row">
                                {item.options.map((option, oIndex) => (
                                  <input
                                    key={oIndex}
                                    value={option}
                                    placeholder={`Opt ${oIndex + 1}`}
                                    onChange={(e) => updateOption(index, oIndex, e.target.value)}
                                    required={oIndex < 2}
                                  />
                                ))}
                              </div>
                              <label>
                                Correct
                                <select
                                  value={item.answer_index}
                                  onChange={(e) => updateQuestion(index, { answer_index: Number(e.target.value) })}
                                >
                                  {item.options.map((option, oIndex) => (
                                    <option key={oIndex} value={oIndex}>
                                      {oIndex + 1}{option ? `: ${option}` : ''}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </>
                          )}

                          <div className="ws-q-actions">
                            <button
                              type="button"
                              className="btn secondary"
                              disabled={form.questions.length <= 1}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  questions: prev.questions.filter((_, i) => i !== index),
                                }));
                                setOpenQ(Math.max(0, index - 1));
                              }}
                            >
                              Remove Q
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="ws-drawer-foot">
                <button className="btn secondary" type="button" onClick={closeEditor}>Cancel</button>
                <button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : (editing ? 'Update' : 'Save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
