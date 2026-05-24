const AUTH_STORAGE_KEY = 'psihub:auth';

export function storeAuthSession(session) {
  if (!session?.token) {
    clearAuthSession();
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredAuthSession() {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored);
    const payload = decodeJwtPayload(session.token);
    if (!payload || !session.user || payload.exp * 1000 <= Date.now()) {
      clearAuthSession();
      return null;
    }

    return {
      ...session,
      tipo: payload.tipo,
      email: payload.email,
    };
  } catch {
    clearAuthSession();
    return null;
  }
}

export function decodeJwtPayload(token) {
  const payload = token?.split('.')[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}
