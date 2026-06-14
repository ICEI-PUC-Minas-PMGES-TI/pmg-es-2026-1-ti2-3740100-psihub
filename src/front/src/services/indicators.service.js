import { apiRequest } from './http.service.js';

const INDICATORS_BASE = '/api/psicologos/me/indicadores';

export const indicatorsApi = {
    getSummary({ inicio, fim, signal } = {}) {
        return apiRequest(INDICATORS_BASE, {
            query: { inicio, fim },
            signal,
        });
    },

    getPaymentCompletion({ inicio, fim, signal } = {}) {
        return apiRequest(`${INDICATORS_BASE}/pagamentos-efetuados`, {
            query: { inicio, fim },
            signal,
        });
    },
};
