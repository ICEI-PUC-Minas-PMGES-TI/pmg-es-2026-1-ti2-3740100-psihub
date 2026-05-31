import { apiRequest } from './http.service.js';

const PSICOLOGO_BASE = '/api/psicologos/me/financeiro/pagamentos';
const PACIENTE_BASE = '/api/pacientes/me/pagamentos';
const NOTIFICACOES_BASE = '/api/usuarios/me/notificacoes';

export const financialApi = {
    // ---- Psicólogo ----

    registerPayment(payload) {
        return apiRequest(PSICOLOGO_BASE, {
            method: 'POST',
            body: payload,
        });
    },

    confirmPayment(pagamentoId, body) {
        return apiRequest(`${PSICOLOGO_BASE}/${pagamentoId}/confirmar`, {
            method: 'PATCH',
            body,
        });
    },

    refundPayment(pagamentoId) {
        return apiRequest(`${PSICOLOGO_BASE}/${pagamentoId}/estornar`, {
            method: 'PATCH',
        });
    },

    listPsychologistPayments({ status, inicio, fim, signal } = {}) {
        return apiRequest(PSICOLOGO_BASE, {
            query: { status, inicio, fim },
            signal,
        });
    },

    getPaymentDetails(pagamentoId, signal) {
        return apiRequest(`${PSICOLOGO_BASE}/${pagamentoId}`, { signal });
    },

    getPsychologistReceipt(pagamentoId, signal) {
        return apiRequest(`${PSICOLOGO_BASE}/${pagamentoId}/recibo`, { signal });
    },

    // ---- Paciente ----

    listMyPayments({ signal } = {}) {
        return apiRequest(PACIENTE_BASE, { signal });
    },

    getMyReceipt(pagamentoId, signal) {
        return apiRequest(`${PACIENTE_BASE}/${pagamentoId}/recibo`, { signal });
    },

    // ---- Notificações (ambos os perfis) ----

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
