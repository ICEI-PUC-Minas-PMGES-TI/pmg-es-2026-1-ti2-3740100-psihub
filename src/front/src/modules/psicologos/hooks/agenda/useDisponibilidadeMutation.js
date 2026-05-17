import { useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';
import { addDays, toIsoDate } from '@/shared/utils/date.utils';
import { DAY_FULL_LABELS } from './agenda.constants';
import { validateAvailabilityBreak } from './agenda.utils';

/**
 * Salva regras de disponibilidade semanal e de dia unico.
 *
 * @param {Object} params
 * @returns {{ availabilitySaving: boolean, singleDayAvailabilitySaving: boolean, handleAvailabilitySave: Function, handleSingleDayAvailabilitySave: Function }}
 */
export function useDisponibilidadeMutation({
    availabilityModal,
    setAvailabilityModal,
    singleDayAvailabilityModal,
    setSingleDayAvailabilityModal,
    setAvailabilityRules,
    onToast,
    refreshAll,
}) {
    const [availabilitySaving, setAvailabilitySaving] = useState(false);
    const [singleDayAvailabilitySaving, setSingleDayAvailabilitySaving] = useState(false);

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
            onToast?.({ type: 'error', message: 'Nao foi possivel salvar essa disponibilidade.' });
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
            onToast?.({ type: 'error', message: 'Nao foi possivel salvar essa disponibilidade.' });
        } finally {
            setSingleDayAvailabilitySaving(false);
        }
    }

    return {
        availabilitySaving,
        singleDayAvailabilitySaving,
        handleAvailabilitySave,
        handleSingleDayAvailabilitySave,
    };
}
