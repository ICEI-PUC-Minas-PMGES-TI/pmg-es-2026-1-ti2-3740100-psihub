import { apiRequest } from './http.service.js';

export const adminApi = {
    listAdminPsychologists({ status, signal } = {}) {
        return apiRequest('/api/admin/psicologos', {
            query: { status },
            signal,
        });
    },

    approvePsychologist(psicologoId) {
        return apiRequest(`/api/admin/psicologos/${psicologoId}/acesso/aprovar`, {
            method: 'POST',
        });
    },

    revokePsychologist(psicologoId, motivo) {
        return apiRequest(`/api/admin/psicologos/${psicologoId}/acesso/revogar`, {
            method: 'POST',
            body: { motivo },
        });
    },
};
