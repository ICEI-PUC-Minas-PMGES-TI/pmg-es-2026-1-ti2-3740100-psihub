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
                    onToast?.({ type: 'error', message: 'Não foi possível carregar os profissionais.' });
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
            .then(async (data) => {
                const result = await appendEvaluationStatus(data || [], controller.signal);
                if (controller.signal.aborted || result.aborted) return;

                setAppointments(result.appointments);
                if (result.failed) {
                    onToast?.({ type: 'error', message: 'Não foi possível verificar avaliações já enviadas.' });
                }
            })
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast?.({ type: 'error', message: 'Não foi possível carregar suas consultas.' });
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

async function appendEvaluationStatus(appointments, signal) {
    const concluded = appointments.filter((appointment) => appointment.status === 'CONCLUIDA');

    if (concluded.length === 0) {
        return { appointments, failed: false, aborted: false };
    }

    const results = await Promise.all(concluded.map(async (appointment) => {
        try {
            const avaliacao = await schedulingApi.getAvaliacaoConsulta({
                consultaId: appointment.id,
                signal,
            });
            return { id: appointment.id, avaliada: true, avaliacao };
        } catch (error) {
            if (error?.name === 'AbortError') {
                return { id: appointment.id, aborted: true };
            }

            if (error?.status === 404) {
                return { id: appointment.id, avaliada: false };
            }

            return { id: appointment.id, avaliada: false, failed: true };
        }
    }));

    if (signal.aborted || results.some((result) => result.aborted)) {
        return { appointments, failed: false, aborted: true };
    }

    const evaluationsById = new Map(results.map((result) => [result.id, result]));

    return {
        appointments: appointments.map((appointment) => {
            const evaluation = evaluationsById.get(appointment.id);

            if (!evaluation) {
                return appointment;
            }

            return {
                ...appointment,
                avaliada: evaluation.avaliada,
                avaliacao: evaluation.avaliacao || null,
            };
        }),
        failed: results.some((result) => result.failed),
        aborted: false,
    };
}
