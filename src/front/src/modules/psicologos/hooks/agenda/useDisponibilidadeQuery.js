import { useEffect, useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';

/**
 * Busca as regras de disponibilidade do psicologo autenticado.
 *
 * @param {{ onToast?: Function, refreshKey: number }} params
 * @returns {{ availabilityRules: Array, setAvailabilityRules: Function, loadingAvailability: boolean }}
 */
export function useDisponibilidadeQuery({ onToast, refreshKey }) {
    const [availabilityRules, setAvailabilityRules] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setLoadingAvailability(true);

        schedulingApi.listMyAvailability(controller.signal)
            .then((data) => setAvailabilityRules(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('[PsiHub] Erro ao carregar disponibilidade semanal do psicologo', error);
                    onToast?.({ type: 'error', message: 'Nao foi possivel carregar sua disponibilidade semanal.' });
                }
            })
            .finally(() => setLoadingAvailability(false));

        return () => controller.abort();
    }, [onToast, refreshKey]);

    return { availabilityRules, setAvailabilityRules, loadingAvailability };
}
