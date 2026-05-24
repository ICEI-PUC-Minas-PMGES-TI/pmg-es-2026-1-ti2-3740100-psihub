import { addDays, formatTime, toIsoDate } from '@/shared/utils/date.utils';
import { DAY_LABELS, DAY_ORDER, DEFAULT_DURATION } from './agenda.constants';

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
    if (block.status === 'CONFIRMADA') return 'week-calendar__block--confirmed';
    if (block.status === 'EM_ANDAMENTO') return 'week-calendar__block--in-progress';
    if (block.status === 'CONCLUIDA') return 'week-calendar__block--completed';
    if (block.status === 'CANCELADA') return 'week-calendar__block--cancelled';
    if (block.status === 'FALTOU') return 'week-calendar__block--missed';
    return 'week-calendar__block--scheduled';
}

export function consultationStatusLabel(status) {
    return {
        AGENDADA: 'Agendada',
        CONFIRMADA: 'Confirmada',
        EM_ANDAMENTO: 'Em andamento',
        CONCLUIDA: 'Concluida',
        CANCELADA: 'Cancelada',
        FALTOU: 'Faltou',
    }[status] || status;
}

export function statusBadgeClass(status) {
    if (status === 'AGENDADA') return 'status-badge--agendada';
    if (status === 'CONFIRMADA') return 'status-badge--confirmada';
    if (status === 'EM_ANDAMENTO') return 'status-badge--em_andamento';
    if (status === 'CONCLUIDA') return 'status-badge--concluida';
    if (status === 'FALTOU') return 'status-badge--faltou';
    return 'status-badge--cancelada';
}

export function canCancelConsultation(consultation) {
    return consultation.status === 'AGENDADA' && new Date(consultation.inicioEm).getTime() > Date.now();
}

export function validateAvailabilityBreak(state) {
    if (!state.configurarPausa) return null;
    if (!state.pausaInicio || !state.pausaFim) return 'Informe inicio e fim do intervalo.';

    const serviceStart = timeStringToMinutes(state.horaInicio);
    const serviceEnd = timeStringToMinutes(state.horaFim);
    const breakStart = timeStringToMinutes(state.pausaInicio);
    const breakEnd = timeStringToMinutes(state.pausaFim);

    if (breakEnd <= breakStart) return 'Fim do intervalo deve ser posterior ao inicio.';
    if (breakStart < serviceStart || breakEnd > serviceEnd) return 'Intervalo deve estar dentro do horario de atendimento.';

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
