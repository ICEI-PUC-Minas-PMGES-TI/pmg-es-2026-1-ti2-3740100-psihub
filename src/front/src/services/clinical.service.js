import { apiRequest } from './http.service.js';

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

    getTimeline({ pacienteId, psicologoId, inicio, fim, tema, signal }) {
        return apiRequest(`/api/pacientes/${pacienteId}/linha-do-tempo`, {
            query: { psicologoId, inicio, fim, tema },
            signal,
        });
    },

    // Psychologist: list emotional records for a specific patient (requires vinculo aceito)
    listPatientEmotionRecords({ pacienteId, inicio, fim, signal } = {}) {
        return apiRequest(`/api/psicologos/pacientes/${pacienteId}/registros-emocionais`, {
            query: inicio || fim ? { inicio, fim } : undefined,
            signal,
        });
    },

    // Psychologist: list manual evolution records for a specific patient (requires vinculo aceito)
    listPatientEvolutionRecords({ pacienteId, signal } = {}) {
        return apiRequest(`/api/psicologos/pacientes/${pacienteId}/evolucoes`, { signal });
    },

    // Psychologist: annotations on a patient's emotional record
    listRecordAnnotations({ pacienteId, registroId, signal }) {
        return apiRequest(`/api/psicologos/pacientes/${pacienteId}/registros-emocionais/${registroId}/anotacoes`, { signal });
    },

    createRecordAnnotation({ pacienteId, registroId, texto }) {
        return apiRequest(`/api/psicologos/pacientes/${pacienteId}/registros-emocionais/${registroId}/anotacoes`, {
            method: 'POST',
            body: { texto },
        });
    },

    deleteRecordAnnotation({ pacienteId, registroId, anotacaoId }) {
        return apiRequest(`/api/psicologos/pacientes/${pacienteId}/registros-emocionais/${registroId}/anotacoes/${anotacaoId}`, {
            method: 'DELETE',
        });
    },

    // Create manual evolution record (prontuario without consulting)
    createEvolutionRecord(payload) {
        return apiRequest('/api/psicologos/pacientes/evolucao', {
            method: 'POST',
            body: payload,
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
