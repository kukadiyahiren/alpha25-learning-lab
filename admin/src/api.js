const isLocalHost = typeof window !== 'undefined'
  && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');

export const API_ORIGIN = isLocalHost
  ? 'http://127.0.0.1:8000'
  : 'https://alpha25-learning-lab-1.onrender.com';

/** Public learning site (opens in a new tab from admin). */
export const SITE_ORIGIN = isLocalHost
  ? 'http://127.0.0.1:8080'
  : (import.meta.env.VITE_SITE_ORIGIN || 'https://alpha25-learning-lab.herrytestnew.workers.dev');

export function getToken() {
  return localStorage.getItem('alpha25_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('alpha25_token', token);
  else localStorage.removeItem('alpha25_token');
}

export async function api(path, { method = 'GET', body, formData } = {}) {
  const headers = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_ORIGIN}/api${path}`, { method, headers, body: payload });
  } catch (err) {
    const error = new Error(
      `Cannot reach API (${API_ORIGIN}). Check your internet, or if using production wait for Render to wake / redeploy.`,
    );
    error.status = 0;
    error.errors = {};
    error.cause = err;
    throw error;
  }
  const raw = response.status === 204 ? '' : await response.text();
  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = {};
    }
  }

  if (response.status === 401 && path !== '/login') {
    setToken(null);
    if (!window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  }

  const tooLarge = response.status === 413
    || /Content-Length .* exceeds the limit/i.test(raw)
    || /post_max_size|upload_max_filesize/i.test(raw);

  if (tooLarge) {
    const error = new Error('This PDF is too large for the server upload limit (currently needs API redeploy for 64MB). Try again after Render redeploy, or use a PDF under 8MB temporarily.');
    error.status = 413;
    error.errors = {};
    throw error;
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed');
    error.status = response.status;
    error.errors = data?.errors || {};
    throw error;
  }

  // PHP may return 200 with an empty body when post_max_size is exceeded
  if (formData && !raw && response.status === 200) {
    const error = new Error('Upload did not reach the server. The PDF is likely larger than the current server limit. Redeploy the API, then try again.');
    error.status = 413;
    error.errors = {};
    throw error;
  }

  return data;
}

export async function downloadFile(path, filename) {
  const headers = { Accept: '*/*' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_ORIGIN}/api${path}`, { headers });
  if (!response.ok) {
    throw new Error('Could not download the sample file.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
