import { apiRequest } from './http.js';

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

  listConsultations({ status, inicio, fim, signal }) {
    return apiRequest('/api/consultas', {
      query: { status, inicio, fim },
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
    return apiRequest('/api/psicologos/me/agenda/slots', {
      method: 'POST',
      body: payload,
    });
  },

  removeMySlot(slotId) {
    return apiRequest(`/api/psicologos/me/agenda/slots/${slotId}/cancelar`, {
      method: 'PATCH',
    });
  },
};
