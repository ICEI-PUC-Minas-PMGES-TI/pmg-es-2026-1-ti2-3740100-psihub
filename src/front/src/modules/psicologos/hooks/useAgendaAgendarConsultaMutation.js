import { useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';
import { toIsoDate } from '@/shared/utils/date.utils';
import { DEFAULT_DURATION } from '../utils/agenda.constants';
import { minutesToTimeLabel } from '../utils/agenda.utils';

/**
 * Controla criacao de consulta pelo psicologo e acoes de bloquear horarios.
 *
 * @param {Object} params
 * @returns {{ scheduleConsultationSaving: boolean, handleScheduleConsultation: Function, openCellActionMenu: Function, handleCellActionSchedule: Function, handleCellActionBlock: Function, handleUnblockSlot: Function }}
 */
export function useAgendaAgendarConsultaMutation({
    cellActionMenu,
    setCellActionMenu,
    scheduleConsultationModal,
    setScheduleConsultationModal,
    unblockSlotModal,
    setUnblockSlotModal,
    normalizedRules,
    dayValueFromDate,
    onToast,
    refreshAll,
}) {
    const [scheduleConsultationSaving, setScheduleConsultationSaving] = useState(false);

    async function handleScheduleConsultation(event) {
        event.preventDefault();
        if (!scheduleConsultationModal) return;

        setScheduleConsultationSaving(true);
        try {
            const recorrencia = scheduleConsultationModal.recorrencia || 'NENHUMA';
            if (recorrencia === 'NENHUMA') {
                await schedulingApi.scheduleConsultationAsPsychologist({
                    pacienteId: Number(scheduleConsultationModal.pacienteId),
                    inicioEm: scheduleConsultationModal.inicioEm,
                    tipoAtendimento: scheduleConsultationModal.tipoAtendimento,
                    observacoes: scheduleConsultationModal.observacoes || null,
                });
            } else {
                await schedulingApi.scheduleRecurringConsultation({
                    pacienteId: Number(scheduleConsultationModal.pacienteId),
                    inicioEm: scheduleConsultationModal.inicioEm,
                    tipoAtendimento: scheduleConsultationModal.tipoAtendimento,
                    observacoes: scheduleConsultationModal.observacoes || null,
                    frequencia: recorrencia,
                    ocorrencias: Number(scheduleConsultationModal.ocorrencias || 2),
                });
            }

            onToast?.({ type: 'success', message: 'Consulta agendada com sucesso.' });
            setScheduleConsultationModal(null);
            refreshAll();
        } catch (error) {
            onToast?.({ type: 'error', message: error?.message || 'Não foi possível agendar essa consulta.' });
        } finally {
            setScheduleConsultationSaving(false);
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
        setCellActionMenu(null);
        setScheduleConsultationModal({
            inicioEm: `${toIsoDate(date)}T${start}:00`,
            fimEm: `${toIsoDate(date)}T${end}:00`,
            data: toIsoDate(date),
            horaInicio: start,
            horaFim: end,
            pacienteId: null,
            pacienteNome: '',
            tipoAtendimento: 'ONLINE',
            observacoes: '',
            recorrencia: 'NENHUMA',
            ocorrencias: 2,
        });
    }

    async function handleCellActionBlock() {
        if (!cellActionMenu) return;
        const { date, minutesFromMidnight, duration } = cellActionMenu;
        const start = minutesToTimeLabel(minutesFromMidnight);
        const end = minutesToTimeLabel(minutesFromMidnight + (duration || DEFAULT_DURATION));

        setCellActionMenu((current) => ({ ...current, loading: 'block' }));
        try {
            await schedulingApi.createManualSlot({
                data: toIsoDate(date),
                horaInicio: `${start}:00`.slice(0, 8),
                horaFim: `${end}:00`.slice(0, 8),
                motivo: 'Bloqueio manual',
            });
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
        } catch (error) {
            onToast?.({ type: 'error', message: error?.message || 'Não foi possível remover o bloqueio.' });
        }
    }

    return {
        scheduleConsultationSaving,
        handleScheduleConsultation,
        openCellActionMenu,
        handleCellActionSchedule,
        handleCellActionBlock,
        handleUnblockSlot,
    };
}
