import { useEffect, useState } from 'react';
import { api } from '../api';

const TYPES = [
  ['fill_blank', 'Fill in the blank'],
  ['one_line', 'One-line answer'],
  ['short', 'Short answer'],
  ['true_false', 'True / false'],
  ['match', 'Match pairs'],
  ['mcq', 'Multiple choice'],
];

function optionsToText(question) {
  if (!question?.options) return '';
  if (question.type === 'mcq') return question.options.join('\n');
  if (question.type === 'match') return question.options.map((pair) => `${pair.left} | ${pair.right}`).join('\n');
  return '';
}

function textToOptions(type, text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  if (type === 'mcq') return lines;
  if (type === 'match') {
    return lines.map((line) => {
      const [left, right] = line.split('|');
      return { left: (left || '').trim(), right: (right || '').trim() };
    });
  }
  return null;
}

export default function ClassesPage() {
  const [tree, setTree] = useState([]);
  const [gradeId, setGradeId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [chapterId, setChapterId] = useState(null);
  const [error, setError] = useState('');
  const [gradeForm, setGradeForm] = useState({ name: '', group: '1-2', sort_order: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', sort_order: '' });
  const [chapterForm, setChapterForm] = useState({ title: '', body: '', sort_order: '' });
  const [questionForm, setQuestionForm] = useState({ type: 'mcq', prompt: '', answer: '', optionsText: '', sort_order: '' });
  const [editing, setEditing] = useState(null);

  async function load(keep = {}) {
    const data = await api('/classes');
    setTree(data);
    setGradeId(keep.gradeId ?? data[0]?.id ?? null);
    const grade = data.find((item) => item.id === (keep.gradeId ?? data[0]?.id));
    const subject = grade?.subjects?.find((item) => item.id === keep.subjectId) || grade?.subjects?.[0];
    setSubjectId(subject?.id ?? null);
    const chapter = subject?.chapters?.find((item) => item.id === keep.chapterId) || subject?.chapters?.[0];
    setChapterId(chapter?.id ?? null);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const grade = tree.find((item) => item.id === gradeId);
  const subject = grade?.subjects?.find((item) => item.id === subjectId);
  const chapter = subject?.chapters?.find((item) => item.id === chapterId);

  async function run(work) {
    setError('');
    try {
      await work();
    } catch (err) {
      const first = Object.values(err.errors || {})[0];
      setError(first?.[0] || err.message);
    }
  }

  function selectGrade(id) {
    const next = tree.find((item) => item.id === id);
    setGradeId(id);
    setSubjectId(next?.subjects?.[0]?.id ?? null);
    setChapterId(next?.subjects?.[0]?.chapters?.[0]?.id ?? null);
    setEditing(null);
  }

  function selectSubject(id) {
    const next = grade?.subjects?.find((item) => item.id === id);
    setSubjectId(id);
    setChapterId(next?.chapters?.[0]?.id ?? null);
    setEditing(null);
  }

  return (
    <div>
      <div className="top">
        <h1>Classes</h1>
        <p>Add a class, then a language or subject, then chapters and questions. The class page reads this same structure.</p>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="columns">
        <section className="panel">
          <h2>Class</h2>
          {(grade ? [grade] : []).length >= 0 && tree.map((item) => (
            <button key={item.id} className={`list-btn${item.id === gradeId ? ' active' : ''}`} type="button" onClick={() => selectGrade(item.id)}>
              ધોરણ {item.name} <span className="muted">· {item.group}</span>
            </button>
          ))}
          <label htmlFor="grade-name">Grade name</label>
          <input id="grade-name" value={gradeForm.name} onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })} placeholder="1" />
          <label htmlFor="grade-group">Group</label>
          <select id="grade-group" value={gradeForm.group} onChange={(e) => setGradeForm({ ...gradeForm, group: e.target.value })}>
            <option>1-2</option>
            <option>3-5</option>
            <option>6-8</option>
          </select>
          <div className="form-actions">
            <button className="btn" type="button" onClick={() => run(async () => {
              const saved = await api(editing === 'grade' ? `/admin/grades/${gradeId}` : '/admin/grades', {
                method: editing === 'grade' ? 'PUT' : 'POST',
                body: { ...gradeForm, sort_order: Number(gradeForm.sort_order || 0) },
              });
              setGradeForm({ name: '', group: '1-2', sort_order: '' });
              setEditing(null);
              await load({ gradeId: saved.id });
            })}>{editing === 'grade' ? 'Update class' : 'Add class'}</button>
            {grade && <button className="btn secondary" type="button" onClick={() => { setEditing('grade'); setGradeForm({ name: grade.name, group: grade.group, sort_order: grade.sort_order }); }}>Edit</button>}
            {grade && <button className="btn danger" type="button" onClick={() => run(async () => {
              if (!window.confirm('Delete this class and everything inside it?')) return;
              await api(`/admin/grades/${grade.id}`, { method: 'DELETE' });
              await load();
            })}>Delete</button>}
          </div>
        </section>

        <section className="panel">
          <h2>Language / subject</h2>
          {grade?.subjects?.map((item) => (
            <button key={item.id} className={`list-btn${item.id === subjectId ? ' active' : ''}`} type="button" onClick={() => selectSubject(item.id)}>
              {item.name}
            </button>
          ))}
          {!grade && <p className="muted">Add a class first.</p>}
          <label htmlFor="subject-name">Name</label>
          <input id="subject-name" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="ગુજરાતી" />
          <div className="form-actions">
            <button className="btn" type="button" disabled={!grade} onClick={() => run(async () => {
              const saved = await api(editing === 'subject' ? `/admin/subjects/${subjectId}` : '/admin/subjects', {
                method: editing === 'subject' ? 'PUT' : 'POST',
                body: { grade_id: grade.id, name: subjectForm.name, sort_order: Number(subjectForm.sort_order || 0) },
              });
              setSubjectForm({ name: '', sort_order: '' });
              setEditing(null);
              await load({ gradeId: grade.id, subjectId: saved.id });
            })}>{editing === 'subject' ? 'Update' : 'Add'}</button>
            {subject && <button className="btn secondary" type="button" onClick={() => { setEditing('subject'); setSubjectForm({ name: subject.name, sort_order: subject.sort_order }); }}>Edit</button>}
            {subject && <button className="btn danger" type="button" onClick={() => run(async () => {
              if (!window.confirm('Delete this language and its questions?')) return;
              await api(`/admin/subjects/${subject.id}`, { method: 'DELETE' });
              await load({ gradeId: grade.id });
            })}>Delete</button>}
          </div>
        </section>

        <section className="panel">
          <h2>Chapter</h2>
          {subject?.chapters?.map((item) => (
            <button key={item.id} className={`list-btn${item.id === chapterId ? ' active' : ''}`} type="button" onClick={() => { setChapterId(item.id); setEditing(null); }}>
              {item.title}
            </button>
          ))}
          {!subject && <p className="muted">Choose a language first.</p>}
          <label htmlFor="chapter-title">Title</label>
          <input id="chapter-title" value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} placeholder="પાઠ 1" />
          <label htmlFor="chapter-body">Lesson text</label>
          <textarea id="chapter-body" value={chapterForm.body} onChange={(e) => setChapterForm({ ...chapterForm, body: e.target.value })} />
          <div className="form-actions">
            <button className="btn" type="button" disabled={!subject} onClick={() => run(async () => {
              const saved = await api(editing === 'chapter' ? `/admin/chapters/${chapterId}` : '/admin/chapters', {
                method: editing === 'chapter' ? 'PUT' : 'POST',
                body: { subject_id: subject.id, title: chapterForm.title, body: chapterForm.body, sort_order: Number(chapterForm.sort_order || 0) },
              });
              setChapterForm({ title: '', body: '', sort_order: '' });
              setEditing(null);
              await load({ gradeId: grade.id, subjectId: subject.id, chapterId: saved.id });
            })}>{editing === 'chapter' ? 'Update' : 'Add'}</button>
            {chapter && <button className="btn secondary" type="button" onClick={() => { setEditing('chapter'); setChapterForm({ title: chapter.title, body: chapter.body || '', sort_order: chapter.sort_order }); }}>Edit</button>}
            {chapter && <button className="btn danger" type="button" onClick={() => run(async () => {
              if (!window.confirm('Delete this chapter?')) return;
              await api(`/admin/chapters/${chapter.id}`, { method: 'DELETE' });
              await load({ gradeId: grade.id, subjectId: subject.id });
            })}>Delete</button>}
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Questions {chapter ? `· ${chapter.title}` : ''}</h2>
        {!chapter && <p className="muted">Choose a chapter to add questions.</p>}
        {chapter?.questions?.map((question, index) => (
          <div key={question.id} className="list-btn">
            <b>{index + 1}. {question.type}</b>
            <div>{question.prompt}</div>
            <div className="muted">Answer: {question.answer || '—'}</div>
            <div className="form-actions">
              <button className="btn secondary small" type="button" onClick={() => {
                setEditing(`question-${question.id}`);
                setQuestionForm({
                  type: question.type,
                  prompt: question.prompt,
                  answer: question.answer || '',
                  optionsText: optionsToText(question),
                  sort_order: question.sort_order,
                });
              }}>Edit</button>
              <button className="btn danger small" type="button" onClick={() => run(async () => {
                await api(`/admin/questions/${question.id}`, { method: 'DELETE' });
                await load({ gradeId, subjectId, chapterId });
              })}>Delete</button>
            </div>
          </div>
        ))}
        <label htmlFor="q-type">Type</label>
        <select id="q-type" value={questionForm.type} onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}>
          {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <label htmlFor="q-prompt">Question</label>
        <textarea id="q-prompt" value={questionForm.prompt} onChange={(e) => setQuestionForm({ ...questionForm, prompt: e.target.value })} />
        <label htmlFor="q-answer">Answer</label>
        <input id="q-answer" value={questionForm.answer} onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })} />
        {(questionForm.type === 'mcq' || questionForm.type === 'match') && (
          <>
            <label htmlFor="q-options">{questionForm.type === 'mcq' ? 'Choices, one per line' : 'Pairs, one per line as left | right'}</label>
            <textarea id="q-options" value={questionForm.optionsText} onChange={(e) => setQuestionForm({ ...questionForm, optionsText: e.target.value })} />
          </>
        )}
        <div className="form-actions">
          <button className="btn" type="button" disabled={!chapter} onClick={() => run(async () => {
            const editingId = String(editing || '').startsWith('question-') ? Number(String(editing).replace('question-', '')) : null;
            const body = {
              chapter_id: chapter.id,
              type: questionForm.type,
              prompt: questionForm.prompt,
              answer: questionForm.answer,
              options: textToOptions(questionForm.type, questionForm.optionsText),
              sort_order: Number(questionForm.sort_order || 0),
            };
            await api(editingId ? `/admin/questions/${editingId}` : '/admin/questions', {
              method: editingId ? 'PUT' : 'POST',
              body,
            });
            setQuestionForm({ type: 'mcq', prompt: '', answer: '', optionsText: '', sort_order: '' });
            setEditing(null);
            await load({ gradeId, subjectId, chapterId });
          })}>{String(editing || '').startsWith('question-') ? 'Update question' : 'Add question'}</button>
        </div>
      </section>
    </div>
  );
}
