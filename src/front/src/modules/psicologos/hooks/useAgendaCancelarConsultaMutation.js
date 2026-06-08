import { useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';

/**
 * Controla cancelamento de consulta do psicologo.
 *
 * @param {Object} params
 * @returns {{ cancelSubmitting: boolean, handleCancelConsultation: Function }}
 */
export function useAgendaCancelarConsultaMutation({
    consultationModal,
    setConsultationModal,
    cancelReason,
    setCancelReason,
    onToast,
    refreshAll,
}) {
    const [cancelSubmitting, setCancelSubmitting] = useState(false);

    async function handleCancelConsultation() {
        if (!consultationModal) return;

        setCancelSubmitting(true);
        try {
            await schedulingApi.cancelConsultation({
                consultaId: consultationModal.id,
                motivoCancelamento: cancelReason.trim() || null,
            });
            onToast?.({ type: 'success', message: 'Consulta cancelada e horário liberado.' });
            setConsultationModal(null);
            setCancelReason('');
            refreshAll();
        } catch (error) {
            onToast?.({ type: 'error', message: error?.message || 'Não foi possível cancelar essa consulta.' });
        } finally {
            setCancelSubmitting(false);
        }
    }

    return { cancelSubmitting, handleCancelConsultation };
}
