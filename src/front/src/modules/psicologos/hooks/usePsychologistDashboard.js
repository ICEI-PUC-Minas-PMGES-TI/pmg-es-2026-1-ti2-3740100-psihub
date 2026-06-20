import { useEffect, useMemo, useState } from 'react';
import { indicatorsApi } from '@/services/indicators.service';
import { schedulingApi } from '@/services/scheduling.service';
import { addDays, toIsoDate } from '@/shared/utils/date.utils';

const CONSULTATION_RANGE_PAST_DAYS = 90;
const CONSULTATION_RANGE_FUTURE_DAYS = 180;
const ACTIVE_STATUSES = new Set(['AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO']);

export function usePsychologistDashboard() {
    const [consultations, setConsultations] = useState([]);
    const [loadingConsultations, setLoadingC] = useState(true);
    const [performanceIndicators, setPerformanceIndicators] = useState(null);
    const [loadingIndicators, setLoadingIndicators] = useState(true);
    const [indicatorsError, setIndicatorsError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const today = new Date();

        schedulingApi.listConsultations({
            inicio: toIsoDate(addDays(today, -CONSULTATION_RANGE_PAST_DAYS)),
            fim: toIsoDate(addDays(today, CONSULTATION_RANGE_FUTURE_DAYS)),
            historico: true,
            signal: controller.signal,
        })
            .then((data) => setConsultations(data || []))
            .catch((err) => { if (err.name !== 'AbortError') console.error(err); })
            .finally(() => setLoadingC(false));

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const period = currentMonthPeriod();

        setLoadingIndicators(true);
        indicatorsApi.getSummary({
            inicio: period.inicio,
            fim: period.fim,
            signal: controller.signal,
        })
            .then((data) => {
                setPerformanceIndicators(data || null);
                setIndicatorsError('');
            })
            .catch((err) => {
                if (err?.name !== 'AbortError') {
                    setIndicatorsError(err.message || 'Não foi possível carregar os indicadores.');
                }
            })
            .finally(() => setLoadingIndicators(false));

        return () => controller.abort();
    }, []);

    const todayKey = toIsoDate(new Date());
    const currentMonthKey = todayKey.slice(0, 7);
    const lastMonthKey = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return toIsoDate(d).slice(0, 7);
    })();

    const todayConsultations = useMemo(() =>
        consultations
            .filter((c) => c.inicioEm.slice(0, 10) === todayKey)
            .sort((a, b) => new Date(a.inicioEm) - new Date(b.inicioEm)),
        [consultations, todayKey]);

    const completedToday = useMemo(() =>
        todayConsultations.filter((c) => c.status === 'CONCLUIDA').length,
        [todayConsultations]);

    const pendingToday = useMemo(() =>
        todayConsultations.length - completedToday,
        [todayConsultations, completedToday]);

    const activePatients = useMemo(() => {
        const ids = new Set(
            consultations
                .filter((c) => ACTIVE_STATUSES.has(c.status))
                .map((c) => c.pacienteId)
        );
        return ids.size;
    }, [consultations]);

    const totalPatients = useMemo(() =>
        new Set(consultations.map((c) => c.pacienteId)).size,
        [consultations]
    );

    const sessionsThisMonth = useMemo(() =>
        consultations.filter(
            (c) =>
                c.inicioEm.slice(0, 7) === currentMonthKey &&
                c.status === 'CONCLUIDA'
        ).length,
        [consultations, currentMonthKey]);

    const sessionsLastMonth = useMemo(() =>
        consultations.filter(
            (c) =>
                c.inicioEm.slice(0, 7) === lastMonthKey &&
                c.status === 'CONCLUIDA'
        ).length,
        [consultations, lastMonthKey]);

    const sessionGrowth = sessionsLastMonth > 0
        ? Math.round(((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) * 100)
        : null;

    const notifications = useMemo(() => {
        const list = [];

        const pendingLinks = consultations.filter(
            (c) => c.status === 'PENDENTE_VINCULO'
        );

        if (pendingLinks.length > 0) {
            list.push({
                id: 'links',
                icon: 'link',
                title: `${pendingLinks.length} solicitação(ões) de vínculo`,
                sub: 'Pacientes aguardando aceite',
                time: null,
            });
        }

        const newToday = consultations.filter(
            (c) =>
                c.criadoEm?.slice(0, 10) === todayKey &&
                c.status === 'AGENDADA'
        );

        if (newToday.length > 0) {
            list.push({
                id: 'new',
                icon: 'user',
                title: `${newToday.length} nova(s) consulta(s) agendada(s)`,
                sub: 'Aguardando confirmação',
                time: newToday[0].criadoEm,
            });
        }

        if (list.length === 0 && !loadingConsultations) {
            list.push({
                id: 'ok',
                icon: 'ok',
                title: 'Tudo em dia!',
                sub: 'Sem notificações pendentes.',
                time: null,
            });
        }

        return list;
    }, [consultations, todayKey, loadingConsultations]);

    return {
        loadingConsultations,
        todayConsultations,
        completedToday,
        pendingToday,
        activePatients,
        totalPatients,
        sessionsThisMonth,
        sessionGrowth,
        notifications,
        performanceIndicators,
        loadingIndicators,
        indicatorsError,
    };
}

function currentMonthPeriod() {
    const today = new Date();
    return {
        inicio: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        fim: toIsoDate(today),
    };
}