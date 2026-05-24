import { useEffect, useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';
import { addDays, toIsoDate } from '@/shared/utils/date.utils';
import { MANUAL_SLOT_RANGE_DAYS } from './agenda.constants';

/**
 * Busca horarios avulsos/bloqueios da agenda do psicologo autenticado.
 *
 * @param {{ onToast?: Function, refreshKey: number }} params
 * @returns {{ manualSlots: Array, loadingSlots: boolean }}
 */
export function useHorariosAvulsosQuery({ onToast, refreshKey }) {
    const [manualSlots, setManualSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const today = new Date();
        setLoadingSlots(true);

        schedulingApi.listMyBlocks({
            inicio: `${toIsoDate(addDays(today, -MANUAL_SLOT_RANGE_DAYS))}T00:00:00`,
            fim: `${toIsoDate(addDays(today, MANUAL_SLOT_RANGE_DAYS))}T23:59:59`,
            signal: controller.signal,
        })
            .then((data) => setManualSlots(Array.isArray(data) ? data : []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast?.({ type: 'error', message: 'Nao foi possivel carregar os horarios avulsos.' });
                }
            })
            .finally(() => setLoadingSlots(false));

        return () => controller.abort();
    }, [onToast, refreshKey]);

    return { manualSlots, loadingSlots };
}
