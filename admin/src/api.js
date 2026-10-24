export const API_ORIGIN = 'https://alpha25-learning-lab-1.onrender.com';

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

  const response = await fetch(`${API_ORIGIN}/api${path}`, { method, headers, body: payload });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));

  if (response.status === 401 && path !== '/login') {
    setToken(null);
    if (!window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed');
    error.status = response.status;
    error.errors = data?.errors || {};
    throw error;
  }

  return data;
}
