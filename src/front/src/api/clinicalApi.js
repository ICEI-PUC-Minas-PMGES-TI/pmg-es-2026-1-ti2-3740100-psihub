import { apiRequest } from './http.js';

export const clinicalApi = {
    getPsychologistProfile(signal) {
        return apiRequest('/api/psicologos/me/perfil', { signal });
    },

    updatePsychologistProfile(payload) {
        return apiRequest('/api/psicologos/me/perfil', {
            method: 'PATCH',
            body: payload,
        });
    },

    listPsychologistLinks({ status, signal } = {}) {
        return apiRequest('/api/psicologos/me/vinculos', {
            query: { status },
            signal,
        });
    },

    acceptLink(vinculoId) {
        return apiRequest(`/api/psicologos/me/vinculos/${vinculoId}/aceitar`, {
            method: 'PATCH',
        });
    },

    rejectLink(vinculoId) {
        return apiRequest(`/api/psicologos/me/vinculos/${vinculoId}/recusar`, {
            method: 'PATCH',
        });
    },

    getTimeline({ pacienteId, inicio, fim, tema, signal }) {
        return apiRequest(`/api/pacientes/${pacienteId}/linha-do-tempo`, {
            query: { inicio, fim, tema },
            signal,
        });
    },

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
