import { apiRequest } from './http.service.js';

export const psychologistApi = {
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

    listPatientEmotionRecords({ pacienteId, inicio, fim, signal } = {}) {
        return apiRequest(`/api/psicologos/pacientes/${pacienteId}/registros-emocionais`, {
            query: inicio || fim ? { inicio, fim } : undefined,
            signal,
        });
    },

    listPatientEvolutionRecords({ pacienteId, signal } = {}) {
        return apiRequest(`/api/psicologos/pacientes/${pacienteId}/evolucoes`, { signal });
    },

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

    createEvolutionRecord(payload) {
        return apiRequest('/api/psicologos/pacientes/evolucao', {
            method: 'POST',
            body: payload,
        });
    },
};
