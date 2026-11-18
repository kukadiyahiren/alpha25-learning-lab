import { api } from './api';

const HEADER_ALIASES = {
  lang: 'language',
  story_language: 'language',
  story: 'body',
  story_text: 'body',
  text: 'body',
  content: 'body',
  name: 'title',
  story_title: 'title',
  order: 'sort_order',
  sort: 'sort_order',
  class: 'grade',
  standard: 'grade',
  desc: 'description',
  details: 'description',
  sec: 'section',
  type: 'section',
  gk_section: 'section',
  cat: 'category',
  topic_category: 'category',
  q: 'question',
  a: 'answer',
  ans: 'answer',
  option1: 'option_1',
  option2: 'option_2',
  option3: 'option_3',
  option4: 'option_4',
  day: 'day_label',
  label: 'day_label',
  letters: 'letter',
  sound: 'letter',
  example: 'word',
  dialogue: 'script',
};

function normalizeHeader(value) {
  const key = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^\ufeff/, '')
    .replace(/[\s-]+/g, '_');
  return HEADER_ALIASES[key] || key;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  const input = String(text || '').replace(/^\ufeff/, '');

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = input[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => String(value).trim() !== '')) rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  if (row.some((value) => String(value).trim() !== '')) rows.push(row);
  return rows;
}

function parseHtmlTable(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const table = doc.querySelector('table');
  if (!table) return [];
  return Array.from(table.querySelectorAll('tr')).map((tr) => (
    Array.from(tr.querySelectorAll('th,td')).map((cell) => cell.textContent.trim())
  )).filter((row) => row.some((value) => value !== ''));
}

function matrixToObjects(matrix) {
  if (!matrix.length) return [];
  const headers = matrix[0].map(normalizeHeader);
  return matrix.slice(1).map((cells) => {
    const row = {};
    headers.forEach((key, index) => {
      if (!key) return;
      row[key] = cells[index] ?? '';
    });
    return row;
  });
}

/** Read CSV or the HTML .xls samples we generate in the browser. */
export async function parseBulkFile(file) {
  const name = (file?.name || '').toLowerCase();
  const text = await file.text();

  if (name.endsWith('.xlsx')) {
    const error = new Error('Please upload a CSV file (use “Download CSV sample”), or re-save the sheet as CSV.');
    error.code = 'xlsx_unsupported';
    throw error;
  }

  const matrix = (name.endsWith('.xls') || /<table[\s>]/i.test(text)) && /<table[\s>]/i.test(text)
    ? parseHtmlTable(text)
    : parseCsv(text);

  const rows = matrixToObjects(matrix);
  if (!rows.length) {
    throw new Error('No data rows found in the file.');
  }
  return rows;
}

function isBlankRow(row, keys) {
  return keys.every((key) => String(row[key] ?? '').trim() === '');
}

function buildFormData(resource, row) {
  const data = new FormData();

  if (resource === 'gk') {
    const rawSection = String(row.section ?? 'general').trim().toLowerCase().replace(/[\s-]+/g, '_');
    const section = ['competitive', 'competitive_exam', 'exam', 'cet'].includes(rawSection)
      ? 'competitive'
      : 'general';
    const category = String(row.category ?? '').trim();
    const question = String(row.question ?? '').trim();
    const answer = String(row.answer ?? '').trim();
    const sortOrder = String(row.sort_order ?? '').trim();
    const options = [row.option_1, row.option_2, row.option_3, row.option_4]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean);

    if (!category && !question && !answer) return { skip: true };
    if (!category || !question || !answer) {
      return { error: 'category, question and answer are needed.' };
    }

    data.append('section', section);
    data.append('category', category);
    data.append('question', question);
    data.append('answer', answer);
    if (sortOrder !== '') data.append('sort_order', sortOrder);
    data.append('options_present', '1');
    options.forEach((option, index) => data.append(`options[${index}]`, option));
    return { data };
  }

  const fieldsByResource = {
    audio: ['section', 'language', 'title', 'body', 'sort_order'],
    worksheets: ['grade', 'title', 'description', 'sort_order'],
    'spoken-english': ['day_label', 'topic', 'script', 'sort_order'],
    phonics: ['day_label', 'letter', 'word', 'sort_order'],
  };
  const keys = fieldsByResource[resource];
  if (!keys) {
    return { error: 'Bulk import is not available for this section.' };
  }
  if (isBlankRow(row, keys.filter((key) => key !== 'section'))) return { skip: true };

  if (resource === 'worksheets') {
    if (!String(row.grade ?? '').trim() || !String(row.title ?? '').trim()) {
      return { error: 'grade and title are needed.' };
    }
  }
  if (resource === 'spoken-english') {
    if (!String(row.day_label ?? '').trim() || !String(row.topic ?? '').trim()) {
      return { error: 'day and topic are needed.' };
    }
  }
  if (resource === 'phonics') {
    if (!String(row.day_label ?? '').trim() || !String(row.letter ?? '').trim() || !String(row.word ?? '').trim()) {
      return { error: 'day, letter and word are needed.' };
    }
  }
  if (resource === 'audio') {
    if (!String(row.title ?? '').trim() && !String(row.body ?? '').trim()) {
      return { error: 'add at least a title or story text.' };
    }
    const rawSection = String(row.section ?? 'story').trim().toLowerCase().replace(/[\s-]+/g, '_');
    row.section = ['learning', 'learn', 'lesson', 'education'].includes(rawSection)
      ? 'learning'
      : 'story';
  }

  keys.forEach((key) => {
    const value = String(row[key] ?? '').trim();
    if (key === 'sort_order' && value === '') return;
    if (value !== '') data.append(key, value);
  });

  return { data };
}

/**
 * Import rows using the normal create endpoint so every bulk menu works
 * even when the dedicated /admin/bulk/... API route is not deployed yet.
 */
export async function importBulkRows(resource, file) {
  const rows = await parseBulkFile(file);
  let created = 0;
  let skipped = 0;
  const errors = [];

  for (let index = 0; index < rows.length; index += 1) {
    const line = index + 2;
    const built = buildFormData(resource, rows[index]);
    if (built.skip) {
      skipped += 1;
      continue;
    }
    if (built.error) {
      skipped += 1;
      errors.push(`Row ${line}: ${built.error}`);
      continue;
    }
    try {
      await api(`/admin/${resource}`, { method: 'POST', formData: built.data });
      created += 1;
    } catch (err) {
      skipped += 1;
      const first = Object.values(err.errors || {})[0];
      errors.push(`Row ${line}: ${first?.[0] || err.message || 'failed'}`);
    }
  }

  return {
    message: `Imported ${created} item${created === 1 ? '' : 's'}.`,
    created,
    skipped,
    errors,
  };
}
