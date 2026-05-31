import { apiRequest } from './http.service.js';

const NOTIFICACOES_BASE = '/api/usuarios/me/notificacoes';

export const notificationApi = {
    listNotifications({ lida, signal } = {}) {
        return apiRequest(NOTIFICACOES_BASE, {
            query: { lida },
            signal,
        });
    },

    markNotificationRead(notificacaoId) {
        return apiRequest(`${NOTIFICACOES_BASE}/${notificacaoId}/marcar-lida`, {
            method: 'PATCH',
        });
    },

    markAllNotificationsRead() {
        return apiRequest(`${NOTIFICACOES_BASE}/marcar-todas-lidas`, {
            method: 'PATCH',
        });
    },
};
