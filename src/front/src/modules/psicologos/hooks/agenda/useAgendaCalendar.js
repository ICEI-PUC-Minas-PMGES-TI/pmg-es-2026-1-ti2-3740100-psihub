import { useMemo } from 'react';
import { addDays, toIsoDate } from '@/shared/utils/date.utils';
import { CALENDAR_END_HOUR, CALENDAR_SLOT_MINUTES, CALENDAR_START_HOUR, DEFAULT_DURATION, GRID_CONSULTATION_STATUSES } from '../../utils/agenda.constants';
import {
    buildAvailabilitySummary,
    buildCalendarRows,
    buildWeekAvailability,
    buildWeekBlocks,
    buildWeekBreakBlocks,
    buildWeekDays,
    buildWeekDurations,
    dayValueFromDate,
    latestRulesByDay,
    startOfWeek,
} from '../../utils/agenda.utils';

/**
 * Deriva todos os dados de calendario semanal a partir das regras, consultas e bloqueios.
 *
 * @param {{ availabilityRules: Array, consultations: Array, manualSlots: Array, weekStart: Date }} params
 * @returns {Object} dados prontos para renderizacao do calendario
 */
export function useAgendaCalendar({ availabilityRules, consultations, manualSlots, weekStart }) {
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

    const weekAvailabilityByDay = useMemo(() => buildWeekAvailability(weekDays, normalizedRules), [normalizedRules, weekDays]);
    const weekDurationByDay = useMemo(() => buildWeekDurations(weekDays, normalizedRules), [normalizedRules, weekDays]);
    const weekBreakBlocks = useMemo(() => buildWeekBreakBlocks(weekDays, normalizedRules), [normalizedRules, weekDays]);
    const weekConsultationBlocks = useMemo(() => buildWeekBlocks(weekDays, weekConsultations), [weekConsultations, weekDays]);
    const weekBlockedSlots = useMemo(() => {
        const start = weekStart;
        const end = addDays(weekStart, 7);
        return (Array.isArray(manualSlots) ? manualSlots : [])
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

    return {
        normalizedRules,
        availabilitySummary,
        weekDays,
        calendarRows,
        isPastWeek,
        disablePreviousWeek,
        weekAvailabilityByDay,
        weekDurationByDay,
        weekBreakBlocks,
        weekConsultationBlocks,
        weekBlockedSlots,
        dayValueFromDate,
        DEFAULT_DURATION,
    };
}
