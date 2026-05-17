import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';
import { addDays, formatDate, formatTime, toIsoDate } from '@/shared/utils/date.utils';

export const DAY_ORDER = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];
export const DAY_LABELS = {
    SEGUNDA: 'Seg',
    TERCA: 'Ter',
    QUARTA: 'Qua',
    QUINTA: 'Qui',
    SEXTA: 'Sex',
    SABADO: 'Sáb',
    DOMINGO: 'Dom',
};
export const DAY_FULL_LABELS = {
    SEGUNDA: 'Segunda',
    TERCA: 'Terça',
    QUARTA: 'Quarta',
    QUINTA: 'Quinta',
    SEXTA: 'Sexta',
    SABADO: 'Sábado',
    DOMINGO: 'Domingo',
};
export const DAY_OPTIONS = DAY_ORDER.map((value) => ({ value, label: DAY_FULL_LABELS[value] }));
export const ACTIVE_STATUSES = new Set(['AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO']);
export const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Todos' },
    { value: 'AGENDADA', label: 'Agendada' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
    { value: 'CANCELADA', label: 'Cancelada' },
];
export const STATUS_OPTIONS_ACTIVE = [
    { value: 'ALL', label: 'Ativos' },
    { value: 'AGENDADA', label: 'Agendada' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
];
export const TYPE_OPTIONS = [
    { value: 'ALL', label: 'Todos' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'PRESENCIAL', label: 'Presencial' },
];
export const GRID_CONSULTATION_STATUSES = new Set(['AGENDADA', 'EM_ANDAMENTO']);
export const DEFAULT_DURATION = 50;
export const CALENDAR_START_HOUR = 7;
export const CALENDAR_END_HOUR = 22;
export const CALENDAR_SLOT_MINUTES = 30;
export const CONSULTATION_PAGE_SIZE = 8;
export const MANUAL_SLOT_RANGE_DAYS = 60;
export const CONSULTATION_RANGE_PAST_DAYS = 90;
export const CONSULTATION_RANGE_FUTURE_DAYS = 180;

export function useAgenda({ onToast }) {
    const [availabilityRules, setAvailabilityRules] = useState([]);
    const [manualSlots, setManualSlots] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingConsultations, setLoadingConsultations] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [availabilityModal, setAvailabilityModal] = useState(null);
    const [singleDayAvailabilityModal, setSingleDayAvailabilityModal] = useState(null);
    const [cellActionMenu, setCellActionMenu] = useState(null);
    const [scheduleConsultationModal, setScheduleConsultationModal] = useState(null);
    const [consultationModal, setConsultationModal] = useState(null);
    const [unblockSlotModal, setUnblockSlotModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelSubmitting, setCancelSubmitting] = useState(false);
    const [availabilitySaving, setAvailabilitySaving] = useState(false);
    const [singleDayAvailabilitySaving, setSingleDayAvailabilitySaving] = useState(false);
    const [scheduleConsultationSaving, setScheduleConsultationSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [consultationPage, setConsultationPage] = useState(1);
    const [showHistory, setShowHistory] = useState(false);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setLoadingAvailability(true);

        schedulingApi.listMyAvailability(controller.signal)
            .then((data) => setAvailabilityRules(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('[PsiHub] Erro ao carregar disponibilidade semanal do psicólogo', error);
                    onToast?.({ type: 'error', message: 'Não foi possível carregar sua disponibilidade semanal.' });
                }
            })
            .finally(() => setLoadingAvailability(false));

        return () => controller.abort();
    }, [onToast, refreshKey]);

    useEffect(() => {
        const controller = new AbortController();
        const today = new Date();
        setLoadingSlots(true);

        schedulingApi.listMySlots({
            inicio: `${toIsoDate(addDays(today, -MANUAL_SLOT_RANGE_DAYS))}T00:00:00`,
            fim: `${toIsoDate(addDays(today, MANUAL_SLOT_RANGE_DAYS))}T23:59:59`,
            signal: controller.signal,
        })
            .then((data) => setManualSlots(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast?.({ type: 'error', message: 'Não foi possível carregar os horários avulsos.' });
                }
            })
            .finally(() => setLoadingSlots(false));

        return () => controller.abort();
    }, [onToast, refreshKey]);

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
                    onToast?.({ type: 'error', message: 'Não foi possível carregar suas consultas.' });
                }
            })
            .finally(() => setLoadingConsultations(false));

        return () => controller.abort();
    }, [onToast, refreshKey]);

    const normalizedRules = useMemo(() => latestRulesByDay(availabilityRules), [availabilityRules]);
    const availabilitySummary = useMemo(() => buildAvailabilitySummary(normalizedRules), [normalizedRules]);
    const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
    const calendarRows = useMemo(() => buildCalendarRows(CALENDAR_START_HOUR, CALENDAR_END_HOUR, CALENDAR_SLOT_MINUTES), []);
    const currentWeekStart = startOfWeek(new Date());
    const isPastWeek = weekStart.getTime() < currentWeekStart.getTime();
    const disablePreviousWeek = weekStart.getTime() <= currentWeekStart.getTime();
    const weekConsultations = useMemo(() => {
        const start = weekStart;
        const end = addDays(weekStart, 7);
        return consultations.filter((consultation) => {
            if (!GRID_CONSULTATION_STATUSES.has(consultation.status)) return false;
            const date = new Date(consultation.inicioEm);
            return date >= start && date < end;
        });
    }, [consultations, weekStart]);

    const filteredConsultations = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return consultations
            .filter((consultation) => {
                if (!showHistory && !ACTIVE_STATUSES.has(consultation.status)) return false;
                if (statusFilter !== 'ALL' && consultation.status !== statusFilter) return false;
                if (typeFilter !== 'ALL' && consultation.tipoAtendimento !== typeFilter) return false;
                if (dateFilter && consultation.inicioEm.slice(0, 10) !== dateFilter) return false;
                if (!normalizedQuery) return true;
                return normalizeText(consultation.pacienteNome).includes(normalizedQuery);
            })
            .sort((first, second) => {
                const diff = new Date(first.inicioEm) - new Date(second.inicioEm);
                return showHistory ? -diff : diff;
            });
    }, [consultations, searchQuery, statusFilter, typeFilter, dateFilter, showHistory]);

    const pagedConsultations = useMemo(() => {
        const startIndex = (consultationPage - 1) * CONSULTATION_PAGE_SIZE;
        return filteredConsultations.slice(startIndex, startIndex + CONSULTATION_PAGE_SIZE);
    }, [consultationPage, filteredConsultations]);

    const rowsWithSeparators = useMemo(() => {
        if (showHistory) return pagedConsultations.map((c) => ({ type: 'consultation', data: c }));
        const todayKey = toIsoDate(new Date());
        const items = [];
        let todayInserted = false;
        for (const consultation of pagedConsultations) {
            const dateKey = consultation.inicioEm.slice(0, 10);
            if (!todayInserted && dateKey === todayKey) {
                items.push({ type: 'separator', label: 'Hoje' });
                todayInserted = true;
            }
            items.push({ type: 'consultation', data: consultation });
        }
        return items;
    }, [pagedConsultations, showHistory]);

    const consultationPages = Math.max(1, Math.ceil(filteredConsultations.length / CONSULTATION_PAGE_SIZE));
    const weekAvailabilityByDay = useMemo(() => buildWeekAvailability(weekDays, normalizedRules), [normalizedRules, weekDays]);
    const weekDurationByDay = useMemo(() => buildWeekDurations(weekDays, normalizedRules), [normalizedRules, weekDays]);
    const weekBreakBlocks = useMemo(() => buildWeekBreakBlocks(weekDays, normalizedRules), [normalizedRules, weekDays]);
    const weekConsultationBlocks = useMemo(() => buildWeekBlocks(weekDays, weekConsultations), [weekConsultations, weekDays]);
    const weekBlockedSlots = useMemo(() => {
        const start = weekStart;
        const end = addDays(weekStart, 7);
        return manualSlots
            .filter((slot) => slot.status === 'BLOQUEADO')
            .filter((slot) => {
                const date = new Date(slot.inicioEm);
                return date >= start && date < end;
            })
            .map((slot) => {
                const start = new Date(slot.inicioEm);
                const end = new Date(slot.fimEm);
                const startMinutes = start.getHours() * 60 + start.getMinutes();
                const durationMinutes = (end - start) / 60000;
                return { ...slot, dayKey: toIsoDate(start), startMinutes, durationMinutes };
            });
    }, [manualSlots, weekStart]);

    useEffect(() => {
        setConsultationPage(1);
    }, [searchQuery, statusFilter, typeFilter, dateFilter, showHistory]);

    function refreshAll() {
        setRefreshKey((current) => current + 1);
    }

    async function handleAvailabilitySave(event) {
        event.preventDefault();
        if (!availabilityModal) return;

        if (availabilityModal.selectedDays.length === 0) {
            onToast?.({ type: 'error', message: 'Selecione ao menos um dia da semana.' });
            return;
        }

        const breakValidationMessage = validateAvailabilityBreak(availabilityModal);
        if (breakValidationMessage) {
            onToast?.({ type: 'error', message: breakValidationMessage });
            return;
        }

        setAvailabilitySaving(true);
        try {
            const result = await schedulingApi.saveAvailability({
                diasSemana: availabilityModal.selectedDays,
                horaInicio: `${availabilityModal.horaInicio}:00`,
                horaFim: `${availabilityModal.horaFim}:00`,
                pausaInicio: availabilityModal.configurarPausa ? `${availabilityModal.pausaInicio}:00` : null,
                pausaFim: availabilityModal.configurarPausa ? `${availabilityModal.pausaFim}:00` : null,
                duracaoSlotMinutos: Number(availabilityModal.duracaoSlotMinutos),
                validoAPartirDe: toIsoDate(new Date()),
                gerarAte: toIsoDate(addDays(new Date(), 60)),
            });

            if (result?.regras?.length) {
                setAvailabilityRules((current) => {
                    const currentFiltered = current.filter((rule) => !availabilityModal.selectedDays.includes(rule.diaSemana));
                    return [...currentFiltered, ...result.regras];
                });
            }

            onToast?.({ type: 'success', message: 'Disponibilidade atualizada.' });
            setAvailabilityModal(null);
            refreshAll();
        } catch {
            onToast?.({ type: 'error', message: 'Não foi possível salvar essa disponibilidade.' });
        } finally {
            setAvailabilitySaving(false);
        }
    }

    async function handleSingleDayAvailabilitySave(event) {
        event.preventDefault();
        if (!singleDayAvailabilityModal) return;

        const breakValidationMessage = validateAvailabilityBreak(singleDayAvailabilityModal);
        if (breakValidationMessage) {
            onToast?.({ type: 'error', message: breakValidationMessage });
            return;
        }

        setSingleDayAvailabilitySaving(true);
        try {
            const result = await schedulingApi.saveAvailability({
                diasSemana: [singleDayAvailabilityModal.dayKey],
                horaInicio: `${singleDayAvailabilityModal.horaInicio}:00`,
                horaFim: `${singleDayAvailabilityModal.horaFim}:00`,
                pausaInicio: singleDayAvailabilityModal.configurarPausa ? `${singleDayAvailabilityModal.pausaInicio}:00` : null,
                pausaFim: singleDayAvailabilityModal.configurarPausa ? `${singleDayAvailabilityModal.pausaFim}:00` : null,
                duracaoSlotMinutos: Number(singleDayAvailabilityModal.duracaoSlotMinutos),
                validoAPartirDe: toIsoDate(new Date()),
                gerarAte: toIsoDate(addDays(new Date(), 60)),
            });

            if (result?.regras?.length) {
                setAvailabilityRules((current) => {
                    const currentFiltered = current.filter((rule) => rule.diaSemana !== singleDayAvailabilityModal.dayKey);
                    return [...currentFiltered, ...result.regras];
                });
            }

            onToast?.({ type: 'success', message: `Disponibilidade de ${DAY_FULL_LABELS[singleDayAvailabilityModal.dayKey]} atualizada.` });
            setSingleDayAvailabilityModal(null);
            refreshAll();
        } catch {
            onToast?.({ type: 'error', message: 'Não foi possível salvar essa disponibilidade.' });
        } finally {
            setSingleDayAvailabilitySaving(false);
        }
    }

    async function handleScheduleConsultation(event) {
        event.preventDefault();
        if (!scheduleConsultationModal) return;

        setScheduleConsultationSaving(true);
        try {
            await schedulingApi.scheduleConsultationAsPsychologist({
                pacienteId: Number(scheduleConsultationModal.pacienteId),
                slotConsultaId: scheduleConsultationModal.slotId,
                tipoAtendimento: scheduleConsultationModal.tipoAtendimento,
                observacoes: scheduleConsultationModal.observacoes || null,
            });

            onToast?.({ type: 'success', message: 'Consulta agendada com sucesso.' });
            setScheduleConsultationModal(null);
            refreshAll();
        } catch {
            onToast?.({ type: 'error', message: 'Não foi possível agendar essa consulta.' });
        } finally {
            setScheduleConsultationSaving(false);
        }
    }

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
        } catch {
            onToast?.({ type: 'error', message: 'Não foi possível cancelar essa consulta.' });
        } finally {
            setCancelSubmitting(false);
        }
    }

    function openCellActionMenu(date, minutesFromMidnight) {
        const dayRule = normalizedRules.get(dayValueFromDate(date));
        const duration = dayRule?.duracaoSlotMinutos || DEFAULT_DURATION;
        setCellActionMenu({ date, minutesFromMidnight, duration, loading: null });
    }

    async function handleCellActionSchedule() {
        if (!cellActionMenu) return;
        const { date, minutesFromMidnight, duration } = cellActionMenu;
        const start = minutesToTimeLabel(minutesFromMidnight);
        const end = minutesToTimeLabel(minutesFromMidnight + (duration || DEFAULT_DURATION));

        setCellActionMenu((current) => ({ ...current, loading: 'schedule' }));
        try {
            const slot = await schedulingApi.createManualSlot({
                data: toIsoDate(date),
                horaInicio: `${start}:00`,
                horaFim: `${end}:00`,
            });
            setCellActionMenu(null);
            setScheduleConsultationModal({
                slotId: slot.id,
                data: toIsoDate(date),
                horaInicio: start,
                horaFim: end,
                pacienteId: null,
                pacienteNome: '',
                tipoAtendimento: 'ONLINE',
                observacoes: '',
            });
        } catch (error) {
            onToast?.({ type: 'error', message: error?.message || 'Não foi possível criar o horário.' });
            setCellActionMenu(null);
        }
    }

    async function handleCellActionBlock() {
        if (!cellActionMenu) return;
        const { date, minutesFromMidnight, duration } = cellActionMenu;
        const start = minutesToTimeLabel(minutesFromMidnight);
        const end = minutesToTimeLabel(minutesFromMidnight + (duration || DEFAULT_DURATION));

        setCellActionMenu((current) => ({ ...current, loading: 'block' }));
        try {
            const slot = await schedulingApi.createManualSlot({
                data: toIsoDate(date),
                horaInicio: `${start}:00`,
                horaFim: `${end}:00`,
            });
            await schedulingApi.blockMySlot(slot.id);
            onToast?.({ type: 'success', message: 'Horário marcado como indisponível.' });
            setCellActionMenu(null);
            refreshAll();
        } catch (error) {
            onToast?.({ type: 'error', message: error?.message || 'Não foi possível bloquear o horário.' });
            setCellActionMenu(null);
        }
    }

    async function handleUnblockSlot() {
        if (!unblockSlotModal) return;
        try {
            await schedulingApi.removeMySlot(unblockSlotModal.id);
            onToast?.({ type: 'success', message: 'Bloqueio removido. Horário disponível novamente.' });
            setUnblockSlotModal(null);
            refreshAll();
        } catch {
            onToast?.({ type: 'error', message: 'Não foi possível remover o bloqueio.' });
        }
    }

    function exportFilteredConsultations() {
        if (filteredConsultations.length === 0) {
            onToast?.({ type: 'error', message: 'Não há consultas para exportar.' });
            return;
        }

        const rows = [
            ['Paciente', 'Data', 'Horário', 'Tipo', 'Status', 'Observações'],
            ...filteredConsultations.map((consultation) => [
                consultation.pacienteNome,
                formatDate(consultation.inicioEm),
                `${formatTime(consultation.inicioEm)} - ${formatTime(consultation.fimEm)}`,
                consultation.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online',
                consultationStatusLabel(consultation.status),
                consultation.observacoes || '',
            ]),
        ];

        const csv = rows
            .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `agenda-psihub-${toIsoDate(new Date())}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    return {
        loadingAvailability,
        loadingSlots,
        loadingConsultations,
        weekStart,
        setWeekStart,
        availabilityModal,
        setAvailabilityModal,
        singleDayAvailabilityModal,
        setSingleDayAvailabilityModal,
        cellActionMenu,
        setCellActionMenu,
        scheduleConsultationModal,
        setScheduleConsultationModal,
        consultationModal,
        setConsultationModal,
        unblockSlotModal,
        setUnblockSlotModal,
        cancelReason,
        setCancelReason,
        cancelSubmitting,
        availabilitySaving,
        singleDayAvailabilitySaving,
        scheduleConsultationSaving,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        searchQuery,
        setSearchQuery,
        dateFilter,
        setDateFilter,
        consultationPage,
        setConsultationPage,
        showHistory,
        setShowHistory,
        showMoreFilters,
        setShowMoreFilters,
        availabilitySummary,
        weekDays,
        calendarRows,
        isPastWeek,
        disablePreviousWeek,
        filteredConsultations,
        rowsWithSeparators,
        consultationPages,
        weekAvailabilityByDay,
        weekDurationByDay,
        weekBreakBlocks,
        weekConsultationBlocks,
        weekBlockedSlots,
        handleAvailabilitySave,
        handleSingleDayAvailabilitySave,
        handleScheduleConsultation,
        handleCancelConsultation,
        openCellActionMenu,
        handleCellActionSchedule,
        handleCellActionBlock,
        handleUnblockSlot,
        exportFilteredConsultations,
    };
}

export function usePatientSearchField({ value, selectedId, onSelect, onClear }) {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    const search = useCallback((term) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!term.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await schedulingApi.listMyPatients({ nome: term.trim() });
                setResults(data || []);
                setOpen(true);
            } catch (error) {
                console.error('[PsiHub] Erro ao buscar pacientes:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, []);

    function handleChange(event) {
        const term = event.target.value;
        setQuery(term);
        if (selectedId) {
            onClear();
        }
        search(term);
    }

    function handleSelect(paciente) {
        setQuery(paciente.nome);
        setResults([]);
        setOpen(false);
        onSelect(paciente);
    }

    function handleBlur(event) {
        if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
            setOpen(false);
            if (!selectedId) {
                setQuery('');
            }
        }
    }

    return {
        query,
        results,
        loading,
        open,
        containerRef,
        search,
        handleChange,
        handleSelect,
        handleBlur,
    };
}


export function latestRulesByDay(rules) {
    const map = new Map();

    rules.forEach((rule) => {
        const current = map.get(rule.diaSemana);
        if (!current || rule.id > current.id) {
            map.set(rule.diaSemana, rule);
        }
    });

    return map;
}

export function buildAvailabilitySummary(map) {
    return DAY_ORDER.map((day) => {
        const rule = map.get(day);
        return rule ? { ...rule, diaSemana: day } : { diaSemana: day, ativo: false };
    });
}

export function buildWeekDays(startDate) {
    return Array.from({ length: 7 }, (_, index) => addDays(startDate, index));
}

export function buildCalendarRows(startHour, endHour, minutesStep) {
    const rows = [];
    for (let minutes = startHour * 60; minutes < endHour * 60; minutes += minutesStep) {
        rows.push({ minutes, label: minutesToTimeLabel(minutes) });
    }
    return rows;
}

export function buildWeekAvailability(weekDays, rulesMap) {
    const map = new Map();
    weekDays.forEach((date) => {
        const dayKey = toIsoDate(date);
        const dayRule = rulesMap.get(dayValueFromDate(date));
        let ranges = [];
        if (dayRule && dayRule.ativo) {
            const start = timeStringToMinutes(dayRule.horaInicio);
            const end = timeStringToMinutes(dayRule.horaFim);
            ranges = splitAvailabilityAroundBreak(start, end, dayRule);
        }
        map.set(dayKey, ranges);
    });
    return map;
}

export function buildWeekDurations(weekDays, rulesMap) {
    const map = new Map();
    weekDays.forEach((date) => {
        const dayRule = rulesMap.get(dayValueFromDate(date));
        map.set(toIsoDate(date), dayRule?.duracaoSlotMinutos || DEFAULT_DURATION);
    });
    return map;
}

export function buildWeekBreakBlocks(weekDays, rulesMap) {
    return weekDays.flatMap((date) => {
        const dayRule = rulesMap.get(dayValueFromDate(date));
        if (!dayRule?.ativo || !hasValidBreak(dayRule)) return [];

        const startMinutes = timeStringToMinutes(dayRule.pausaInicio);
        const endMinutes = timeStringToMinutes(dayRule.pausaFim);
        return [{
            dayKey: toIsoDate(date),
            startMinutes,
            durationMinutes: endMinutes - startMinutes,
            startLabel: minutesToTimeLabel(startMinutes),
            endLabel: minutesToTimeLabel(endMinutes),
        }];
    });
}

export function splitAvailabilityAroundBreak(start, end, rule) {
    if (!hasValidBreak(rule)) {
        return [{ start, end }];
    }

    const breakStart = timeStringToMinutes(rule.pausaInicio);
    const breakEnd = timeStringToMinutes(rule.pausaFim);
    const ranges = [];

    if (breakStart > start) {
        ranges.push({ start, end: Math.min(breakStart, end) });
    }

    if (breakEnd < end) {
        ranges.push({ start: Math.max(breakEnd, start), end });
    }

    return ranges.filter((range) => range.end > range.start);
}

export function buildWeekBlocks(weekDays, consultations) {
    const blocks = [];
    weekDays.forEach((date) => {
        const dayKey = toIsoDate(date);
        consultations.forEach((consultation) => {
            const consultationDateKey = toIsoDate(new Date(consultation.inicioEm));
            if (consultationDateKey !== dayKey) return;
            const start = new Date(consultation.inicioEm);
            const end = new Date(consultation.fimEm);
            blocks.push({
                ...consultation,
                dayKey,
                startMinutes: start.getHours() * 60 + start.getMinutes(),
                durationMinutes: Math.max(30, Math.round((end.getTime() - start.getTime()) / 60000)),
            });
        });
    });
    return blocks;
}

export function isSlotWithinAvailability(minutes, duration, availabilityRanges) {
    const end = minutes + duration;
    return availabilityRanges.some((range) => minutes >= range.start && end <= range.end);
}

export function intervalsOverlap(firstStart, firstEnd, secondStart, secondEnd) {
    return firstStart < secondEnd && firstEnd > secondStart;
}

export function hasValidBreak(rule) {
    if (!rule?.pausaInicio || !rule?.pausaFim) return false;
    const start = timeStringToMinutes(rule.pausaInicio);
    const end = timeStringToMinutes(rule.pausaFim);
    const serviceStart = timeStringToMinutes(rule.horaInicio);
    const serviceEnd = timeStringToMinutes(rule.horaFim);
    return end > start && start >= serviceStart && end <= serviceEnd;
}

export function findBlockAtMinute(dayBlocks, minutes) {
    return dayBlocks.find((block) => minutes >= block.startMinutes && minutes < block.startMinutes + block.durationMinutes);
}

export function weekCalendarBlockClass(block) {
    if (block.status === 'EM_ANDAMENTO') return 'week-calendar__block--in-progress';
    if (block.status === 'CONCLUIDA') return 'week-calendar__block--completed';
    if (block.status === 'CANCELADA') return 'week-calendar__block--cancelled';
    return 'week-calendar__block--scheduled';
}

export function consultationStatusLabel(status) {
    return {
        AGENDADA: 'Agendada',
        CONFIRMADA: 'Confirmada',
        EM_ANDAMENTO: 'Em andamento',
        CONCLUIDA: 'Concluída',
        CANCELADA: 'Cancelada',
        FALTOU: 'Faltou',
    }[status] || status;
}

export function statusBadgeClass(status) {
    if (status === 'AGENDADA' || status === 'CONFIRMADA') return 'status-badge--agendada';
    if (status === 'EM_ANDAMENTO') return 'status-badge--em_andamento';
    if (status === 'CONCLUIDA') return 'status-badge--concluida';
    return 'status-badge--cancelada';
}

export function canCancelConsultation(consultation) {
    return consultation.status === 'AGENDADA' && new Date(consultation.inicioEm).getTime() > Date.now();
}

export function validateAvailabilityBreak(state) {
    if (!state.configurarPausa) return null;
    if (!state.pausaInicio || !state.pausaFim) return 'Informe início e fim do intervalo.';

    const serviceStart = timeStringToMinutes(state.horaInicio);
    const serviceEnd = timeStringToMinutes(state.horaFim);
    const breakStart = timeStringToMinutes(state.pausaInicio);
    const breakEnd = timeStringToMinutes(state.pausaFim);

    if (breakEnd <= breakStart) return 'Fim do intervalo deve ser posterior ao início.';
    if (breakStart < serviceStart || breakEnd > serviceEnd) return 'Intervalo deve estar dentro do horário de atendimento.';

    return null;
}

export function defaultWeeklyAvailabilityModal(availabilitySummary) {
    const selectedDays = availabilitySummary
        .filter((item) => item.ativo)
        .map((item) => item.diaSemana);
    const firstActiveRule = availabilitySummary.find((item) => item.ativo);

    return {
        selectedDays,
        horaInicio: firstActiveRule?.horaInicio ? normalizeClock(firstActiveRule.horaInicio) : '08:00',
        horaFim: firstActiveRule?.horaFim ? normalizeClock(firstActiveRule.horaFim) : '12:00',
        configurarPausa: Boolean(firstActiveRule?.pausaInicio && firstActiveRule?.pausaFim),
        pausaInicio: firstActiveRule?.pausaInicio ? normalizeClock(firstActiveRule.pausaInicio) : '12:00',
        pausaFim: firstActiveRule?.pausaFim ? normalizeClock(firstActiveRule.pausaFim) : '13:00',
        duracaoSlotMinutos: firstActiveRule?.duracaoSlotMinutos || DEFAULT_DURATION,
    };
}

export function defaultSingleDayAvailabilityModal(dayKey, rule) {
    return {
        dayKey,
        horaInicio: rule?.horaInicio ? normalizeClock(rule.horaInicio) : '08:00',
        horaFim: rule?.horaFim ? normalizeClock(rule.horaFim) : '12:00',
        configurarPausa: Boolean(rule?.pausaInicio && rule?.pausaFim),
        pausaInicio: rule?.pausaInicio ? normalizeClock(rule.pausaInicio) : '12:00',
        pausaFim: rule?.pausaFim ? normalizeClock(rule.pausaFim) : '13:00',
        duracaoSlotMinutos: rule?.duracaoSlotMinutos || DEFAULT_DURATION,
    };
}

export function normalizeText(value = '') {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function dayValueFromDate(date) {
    return DAY_ORDER[(date.getDay() + 6) % 7];
}

export function dayHeaderLabel(date) {
    return DAY_LABELS[dayValueFromDate(date)];
}

export function timeStringToMinutes(value) {
    if (!value) return 0;
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
}

export function minutesToTimeLabel(minutes) {
    const safeMinutes = Math.max(0, minutes);
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function normalizeClock(value) {
    if (!value) return '00:00';
    if (typeof value === 'string') {
        return value.slice(0, 5);
    }
    return formatTime(value);
}

export function formatClock(value) {
    return normalizeClock(value);
}

export function startOfWeek(date) {
    const value = new Date(date);
    value.setDate(value.getDate() - value.getDay());
    value.setHours(0, 0, 0, 0);
    return value;
}
