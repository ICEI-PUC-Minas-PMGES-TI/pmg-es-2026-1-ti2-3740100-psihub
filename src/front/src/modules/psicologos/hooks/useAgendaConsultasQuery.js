import { useEffect, useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';
import { addDays, toIsoDate } from '@/shared/utils/date.utils';
import { CONSULTATION_RANGE_FUTURE_DAYS, CONSULTATION_RANGE_PAST_DAYS } from '../utils/agenda.constants';

/**
 * Busca consultas do usuario autenticado no intervalo padrao da agenda.
 *
 * @param {{ onToast?: Function, refreshKey: number }} params
 * @returns {{ consultations: Array, loadingConsultations: boolean }}
 */
export function useAgendaConsultasQuery({ onToast, refreshKey }) {
    const [consultations, setConsultations] = useState([]);
    const [loadingConsultations, setLoadingConsultations] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const today = new Date();
        setLoadingConsultations(true);

        schedulingApi.listConsultations({
            inicio: toIsoDate(addDays(today, -CONSULTATION_RANGE_PAST_DAYS)),
            fim: toIsoDate(addDays(today, CONSULTATION_RANGE_FUTURE_DAYS)),
            historico: true,
            signal: controller.signal,
        })
            .then((data) => setConsultations(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast?.({ type: 'error', message: error?.message || 'Não foi possível carregar suas consultas.' });
                }
            })
            .finally(() => setLoadingConsultations(false));

        return () => controller.abort();
    }, [onToast, refreshKey]);

    return { consultations, loadingConsultations };
}
