import { apiRequest } from './http.service.js';

export const patientApi = {
    getPatientProfile(signal) {
        return apiRequest('/api/pacientes/me/perfil', { signal });
    },

    updatePatientProfile(payload) {
        return apiRequest('/api/pacientes/me/perfil', {
            method: 'PATCH',
            body: payload,
        });
    },

    listEmotionRecords(signal) {
        return apiRequest('/api/pacientes/me/registros-emocionais', { signal });
    },

    listAvailablePsychologists(signal) {
        return apiRequest('/api/psicologos/disponiveis', { signal });
    },

    createEmotionRecord(payload) {
        return apiRequest('/api/pacientes/me/registros-emocionais', {
            method: 'POST',
            body: payload,
        });
    },

    updateEmotionRecord(registroId, payload) {
        return apiRequest(`/api/pacientes/me/registros-emocionais/${registroId}`, {
            method: 'PATCH',
            body: payload,
        });
    },

    requestLink(psicologoId) {
        return apiRequest('/api/pacientes/me/vinculos', {
            method: 'POST',
            body: { psicologoId },
        });
    },
};
