export function getAuthToken() {
    try {
        const stored = window.localStorage.getItem('psihub:auth');
        return stored ? JSON.parse(stored).token : null;
    } catch {
        return null;
    }
}

export function decodeJwt(token) {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export function getCurrentUserId() {
    const token = getAuthToken();
    if (!token) return null;
    const payload = decodeJwt(token);
    return payload?.sub ? Number(payload.sub) : null;
}

