export class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors || [];
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function apiRequest(path, options = {}) {
  const { method = 'GET', query, body, signal, auth = true } = options;
  const url = buildUrl(path, query);
  const headers = new Headers();

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = readToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    method,
    signal,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw toApiError(payload, response.status);
  }

  if (isEnvelope(payload)) {
    if (!payload.success) {
      throw toApiError(payload, response.status);
    }

    return payload.data;
  }

  return payload;
}

function buildUrl(path, query) {
  const url = new URL(`${apiBaseUrl}${path}`, window.location.origin);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function parsePayload(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function isEnvelope(payload) {
  return payload && typeof payload === 'object' && 'success' in payload && 'data' in payload;
}

function toApiError(payload, status) {
  const message = payload?.message || 'Não foi possível concluir a operação.';
  const errors = Array.isArray(payload?.errors) ? payload.errors : [];
  return new ApiError(message, { status, errors });
}

function readToken() {
  try {
    const stored = window.localStorage.getItem('psihub:auth');
    return stored ? JSON.parse(stored).token : null;
  } catch {
    return null;
  }
}
