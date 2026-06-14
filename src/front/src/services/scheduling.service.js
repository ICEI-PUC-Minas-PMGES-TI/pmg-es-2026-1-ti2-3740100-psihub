import { apiRequest } from './http.service.js';

export const schedulingApi = {
    listPsychologists(signal) {
        return apiRequest('/api/psicologos/disponiveis', { signal });
    },

    listMySlots({ inicio, fim, status, signal }) {
        return apiRequest('/api/psicologos/me/agenda/slots', {
            query: { inicio, fim, status },
            signal,
        });
    },

    listMyAvailability(signal) {
        return apiRequest('/api/psicologos/me/disponibilidades', {
            signal,
        });
    },

    listAvailableSlots({ psicologoId, data, signal }) {
        return apiRequest(`/api/psicologos/${psicologoId}/agenda/slots/disponiveis`, {
            query: { data },
            signal,
        });
    },

    listPsychologistMonthSlots({ psicologoId, inicio, fim, signal }) {
        return apiRequest(`/api/psicologos/${psicologoId}/agenda/slots-publicos`, {
            query: { inicio, fim },
            signal,
        });
    },

    scheduleConsultation(payload) {
        return apiRequest('/api/consultas/agendamentos', {
            method: 'POST',
            body: payload,
        });
    },

    scheduleConsultationAsPsychologist(payload) {
        return apiRequest('/api/psicologos/me/agenda/agendamentos', {
            method: 'POST',
            body: payload,
        });
    },

    listConsultations({ status, inicio, fim, historico, signal }) {
        return apiRequest('/api/consultas', {
            query: { status, inicio, fim, historico },
            signal,
        });
    },

    cancelConsultation({ consultaId, motivoCancelamento }) {
        return apiRequest(`/api/consultas/${consultaId}/cancelar`, {
            method: 'PATCH',
            body: { motivoCancelamento },
        });
    },

    saveAvailability(payload) {
        return apiRequest('/api/psicologos/me/disponibilidades', {
            method: 'POST',
            body: payload,
        });
    },

    createManualSlot(payload) {
        return apiRequest('/api/psicologos/me/agenda/bloqueios', {
            method: 'POST',
            body: payload,
        });
    },

    removeMySlot(horarioId) {
        return apiRequest(`/api/psicologos/me/agenda/bloqueios/${horarioId}/cancelar`, {
            method: 'PATCH',
        });
    },

    blockMySlot(horarioId) {
        return apiRequest(`/api/psicologos/me/agenda/bloqueios/${horarioId}/cancelar`, {
            method: 'PATCH',
        });
    },

    listMyBlocks({ inicio, fim, signal }) {
        return apiRequest('/api/psicologos/me/agenda/bloqueios', {
            query: { inicio, fim },
            signal,
        });
    },

    updateConsultation({ consultaId, payload }) {
        return apiRequest(`/api/consultas/${consultaId}`, {
            method: 'PUT',
            body: payload,
        });
    },

    updateConsultationStatus({ consultaId, status, motivo }) {
        return apiRequest(`/api/consultas/${consultaId}/status`, {
            method: 'PATCH',
            body: { status, motivo },
        });
    },

    deleteConsultation(consultaId) {
        return apiRequest(`/api/consultas/${consultaId}`, {
            method: 'DELETE',
        });
    },

    scheduleRecurringConsultation(payload) {
        return apiRequest('/api/consultas/recorrencias', {
            method: 'POST',
            body: payload,
        });
    },

    listMyPatients({ nome, signal } = {}) {
        return apiRequest('/api/psicologos/me/pacientes', {
            query: nome ? { nome } : undefined,
            signal,
        });
    },

    submitAvaliacao({ consultaId, nota, comentario }) {
        return apiRequest(`/api/consultas/${consultaId}/avaliacao`, {
            method: 'POST',
            body: { nota, comentario },
        });
    },

    getAvaliacaoConsulta({ consultaId, signal }) {
        return apiRequest(`/api/consultas/${consultaId}/avaliacao`, {
            signal,
        });
    },

    getPsychologistAvaliacoes(psicologoId) {
        return apiRequest(`/api/psicologos/${psicologoId}/avaliacoes/media`);
    },
};
