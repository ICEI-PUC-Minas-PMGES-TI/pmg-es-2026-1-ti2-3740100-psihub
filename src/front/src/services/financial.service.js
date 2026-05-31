import { apiRequest } from './http.service.js';

const PSICOLOGO_BASE = '/api/psicologos/me/financeiro/pagamentos';
const PACIENTE_BASE = '/api/pacientes/me/pagamentos';

export const financialApi = {
    // ---- Psicologo ----

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

    getFinancialSummary({ inicio, fim, signal } = {}) {
        return apiRequest(`${PSICOLOGO_BASE.replace('/pagamentos', '')}/resumo`, {
            query: { inicio, fim },
            signal,
        });
    },
};
