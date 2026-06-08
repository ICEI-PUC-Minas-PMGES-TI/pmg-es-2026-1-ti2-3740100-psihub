import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { psychologistApi } from '@/services/psychologist.service';
import { schedulingApi } from '@/services/scheduling.service';
import { getCurrentUserId } from '@/shared/utils/jwt.utils';

function toValidDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getEvolutionDate(item) {
    return toValidDate(item?.criadoEm || item?.inicioEm || item?.registradoEm || item?.atualizadoEm);
}

function getRecordDate(item) {
    return toValidDate(item?.registradoEm || item?.criadoEm || item?.atualizadoEm);
}

function asArray(value) {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
}

function getTimelineItemId(item) {
    if (item?.evolucaoId) return `evolucao-${item.evolucaoId}`;
    if (item?.prontuarioId) return `prontuario-${item.prontuarioId}`;
    if (item?.id) return `id-${item.id}`;
    if (item?.consultaId) return `consulta-${item.consultaId}`;
    return null;
}

function mergeOptimisticEvolution(items, optimisticEvolution) {
    if (!optimisticEvolution) return items;

    const optimisticId = getTimelineItemId(optimisticEvolution);
    const alreadyExists = optimisticId
        ? items.some((item) => getTimelineItemId(item) === optimisticId)
        : false;

    return alreadyExists ? items : [optimisticEvolution, ...items];
}

function normalizeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function average(values) {
    if (values.length === 0) return null;
    return values.reduce((total, value) => total + value, 0) / values.length;
}

function calculateMetricDelta(items, getDate, getValue) {
    const values = (items || [])
        .map((item) => ({
            date: getDate(item),
            value: normalizeNumber(getValue(item)),
        }))
        .filter((item) => item.date && item.value !== null)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((item) => item.value);

    if (values.length < 5) return null;

    const recentAverage = average(values.slice(0, 5));
    const previousAverage = average(values.slice(5, 10));

    if (recentAverage === null || previousAverage === null) return null;

    return recentAverage - previousAverage;
}

function calculateTrend(timeline, records) {
    const progressDelta = calculateMetricDelta(
        timeline,
        getEvolutionDate,
        (item) => item?.nivelProgresso
    );
    const moodDelta = calculateMetricDelta(
        records,
        getRecordDate,
        (item) => item?.humorDia
    );
    const deltas = [progressDelta, moodDelta].filter((value) => value !== null);

    if (deltas.length === 0) return null;

    const delta = average(deltas);

    if (delta >= 0.5) return 'melhora';
    if (delta <= -0.5) return 'piora';
    return 'estabilidade';
}

export function useReports({ initialPatientId, onToast }) {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(() =>
        initialPatientId ? String(initialPatientId) : ''
    );
    const [timeline, setTimeline] = useState([]);
    const [records, setRecords] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [error, setError] = useState('');
    const refreshControllerRef = useRef(null);

    const fetchClinicalData = useCallback(async (signal, optimisticEvolution) => {
        if (!selectedPatient) {
            setTimeline([]);
            setRecords([]);
            setLoadingTimeline(false);
            setLoadingRecords(false);
            return;
        }

        setLoadingTimeline(true);
        setLoadingRecords(true);
        const psicologoId = getCurrentUserId();

        try {
            const [timelineResult, recordsResult, evolutionsResult] = await Promise.allSettled([
                psychologistApi.getTimeline({
                    pacienteId: selectedPatient,
                    psicologoId,
                    signal
                }),
                psychologistApi.listPatientEmotionRecords({
                    pacienteId: selectedPatient,
                    signal
                }),
                psychologistApi.listPatientEvolutionRecords({
                    pacienteId: selectedPatient,
                    signal
                }),
            ]);

            if (signal?.aborted) {
                return;
            }

            if (timelineResult.status === 'rejected') {
                throw timelineResult.reason;
            }

            if (evolutionsResult.status === 'rejected') {
                throw evolutionsResult.reason;
            }

            const nextTimeline = mergeOptimisticEvolution([
                ...asArray(timelineResult.value),
                ...asArray(evolutionsResult.value),
            ], optimisticEvolution);

            setTimeline(nextTimeline);
            setRecords(recordsResult.status === 'fulfilled' ? asArray(recordsResult.value) : []);
            setError('');
        } catch (err) {
            if (err?.name !== 'AbortError' && !signal?.aborted) {
                setTimeline([]);
                setRecords([]);
                setError(err?.message || 'Não foi possível carregar a linha do tempo clínica.');
                onToast?.({ type: 'error', message: 'Acesso clínico negado sem vínculo aceito.' });
            }
        } finally {
            if (!signal?.aborted) {
                setLoadingTimeline(false);
                setLoadingRecords(false);
            }
        }
    }, [selectedPatient, onToast]);

    useEffect(() => {
        const controller = new AbortController();
        schedulingApi.listMyPatients({ signal: controller.signal })
            .then((data) => {
                if (controller.signal.aborted) return;
                setPatients(data || []);
                setSelectedPatient((prev) => prev || (data?.[0]?.id ? String(data[0].id) : ''));
            })
            .catch((err) => {
                if (err?.name !== 'AbortError' && !controller.signal.aborted) {
                    setError(err?.message || 'Não foi possível carregar pacientes.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoadingPatients(false);
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        refreshControllerRef.current?.abort();
        const controller = new AbortController();
        fetchClinicalData(controller.signal);
        return () => controller.abort();
    }, [fetchClinicalData]);

    useEffect(() => () => {
        refreshControllerRef.current?.abort();
    }, []);

    const mergedTimeline = useMemo(() => {
        const evolutionEvents = (timeline || [])
            .map((item) => {
                const date = getEvolutionDate(item);
                return date ? { type: 'evolucao', date, data: item } : null;
            })
            .filter(Boolean);

        const recordEvents = (records || [])
            .map((item) => {
                const date = getRecordDate(item);
                return date ? { type: 'registro', date, data: item } : null;
            })
            .filter(Boolean);

        return [...evolutionEvents, ...recordEvents]
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [timeline, records]);

    const tendencia = useMemo(() => calculateTrend(timeline, records), [timeline, records]);
    const refreshReports = useCallback((optimisticEvolution) => {
        refreshControllerRef.current?.abort();
        const controller = new AbortController();
        refreshControllerRef.current = controller;

        return fetchClinicalData(controller.signal, optimisticEvolution)
            .finally(() => {
                if (refreshControllerRef.current === controller) {
                    refreshControllerRef.current = null;
                }
            });
    }, [fetchClinicalData]);

    return {
        patients,
        selectedPatient,
        setSelectedPatient,
        timeline,
        records,
        mergedTimeline,
        tendencia,
        loadingPatients,
        loadingTimeline,
        loadingRecords,
        error,
        refreshReports,
    };
}
