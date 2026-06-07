import { useEffect, useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';
import { addDays, toIsoDate } from '@/shared/utils/date.utils';

/**
 * Busca psicologos disponiveis e consultas do paciente autenticado.
 *
 * @param {{ activeView: string, showHistory: boolean, refreshKey: number, onToast?: Function }} params
 * @returns {{ psychologists: Array, appointments: Array, loadingDashboardData: boolean }}
 */
export function usePatientDashboardData({ activeView, showHistory, refreshKey, onToast }) {
    const [psychologists, setPsychologists] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loadingPsychologists, setLoadingPsychologists] = useState(false);
    const [loadingAppointments, setLoadingAppointments] = useState(false);

    useEffect(() => {
        if (activeView !== 'schedule') return undefined;

        const controller = new AbortController();
        setLoadingPsychologists(true);
        schedulingApi.listPsychologists(controller.signal)
            .then((data) => setPsychologists(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast?.({ type: 'error', message: 'Nao foi possivel carregar os profissionais.' });
                }
            })
            .finally(() => setLoadingPsychologists(false));

        return () => controller.abort();
    }, [activeView, onToast]);

    useEffect(() => {
        if (activeView !== 'appointments') return undefined;

        const controller = new AbortController();
        const today = new Date();

        setLoadingAppointments(true);
        schedulingApi.listConsultations({
            inicio: showHistory ? toIsoDate(addDays(today, -365)) : toIsoDate(today),
            fim: showHistory ? toIsoDate(addDays(today, 30)) : toIsoDate(addDays(today, 120)),
            historico: showHistory,
            signal: controller.signal,
        })
            .then((data) => setAppointments(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast?.({ type: 'error', message: 'Nao foi possivel carregar suas consultas.' });
                }
            })
            .finally(() => setLoadingAppointments(false));

        return () => controller.abort();
    }, [activeView, onToast, refreshKey, showHistory]);

    return {
        psychologists,
        appointments,
        loadingDashboardData: loadingPsychologists || loadingAppointments,
    };
}
