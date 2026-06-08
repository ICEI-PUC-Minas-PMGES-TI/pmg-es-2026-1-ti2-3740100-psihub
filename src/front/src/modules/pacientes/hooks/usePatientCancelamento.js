import { useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';

/**
 * Controla modal inline e mutation de cancelamento de consulta do paciente.
 *
 * @param {{ onToast?: Function, onCanceled?: Function }} params
 * @returns {{ canceling: Object|null, setCanceling: Function, cancelReason: string, setCancelReason: Function, submittingCancelamento: boolean, confirmCancel: Function, abortCancel: Function }}
 */
export function usePatientCancelamento({ onToast, onCanceled }) {
    const [canceling, setCanceling] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [submittingCancelamento, setSubmittingCancelamento] = useState(false);

    async function confirmCancel(appointment) {
        setSubmittingCancelamento(true);
        try {
            await schedulingApi.cancelConsultation({
                consultaId: appointment.id,
                motivoCancelamento: cancelReason.trim() || null,
            });
            setCanceling(null);
            setCancelReason('');
            onCanceled?.();
            onToast?.({ type: 'success', message: 'Consulta cancelada e horário liberado.' });
        } catch {
            onToast?.({ type: 'error', message: 'Não foi possível cancelar essa consulta.' });
        } finally {
            setSubmittingCancelamento(false);
        }
    }

    function abortCancel() {
        setCanceling(null);
    }

    return {
        canceling,
        setCanceling,
        cancelReason,
        setCancelReason,
        submittingCancelamento,
        confirmCancel,
        abortCancel,
    };
}
