import { useEffect, useMemo, useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';
import { endExclusiveOfMonth, startOfMonth, toIsoDate } from '@/shared/utils/date.utils';
import { getSlotInicio } from '../utils/patient.utils';

/**
 * Controla o fluxo de selecao de psicologo, data, horario e confirmacao de agendamento.
 *
 * @param {{ activeView: string, onNavigate?: Function, onToast?: Function, onScheduled?: Function }} params
 * @returns {Object} estado e handlers do fluxo de agendamento do paciente
 */
export function usePatientAgendamento({ activeView, onNavigate, onToast, onScheduled }) {
    const [step, setStep] = useState('search');
    const [selectedPsychologist, setSelectedPsychologist] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
    const [monthSlots, setMonthSlots] = useState([]);
    const [selectedDateKey, setSelectedDateKey] = useState(null);
    const [daySlots, setDaySlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [tipoAtendimento, setTipoAtendimento] = useState('ONLINE');
    const [observacoes, setObservacoes] = useState('');
    const [loadingAgendamento, setLoadingAgendamento] = useState(false);
    const [submittingAgendamento, setSubmittingAgendamento] = useState(false);
    const [bookedConsulta, setBookedConsulta] = useState(null);

    const availableDateKeys = useMemo(() => {
        return new Set(
            monthSlots
                .filter((slot) => new Date(getSlotInicio(slot)).getTime() > Date.now())
                .map((slot) => getSlotInicio(slot).slice(0, 10)),
        );
    }, [monthSlots]);

    useEffect(() => {
        if (!selectedPsychologist || step !== 'agenda') return undefined;

        const controller = new AbortController();
        const inicio = `${toIsoDate(startOfMonth(currentMonth))}T00:00:00`;
        const fim = `${toIsoDate(endExclusiveOfMonth(currentMonth))}T00:00:00`;

        setLoadingAgendamento(true);
        schedulingApi.listPsychologistMonthSlots({
            psicologoId: selectedPsychologist.id,
            inicio,
            fim,
            signal: controller.signal,
        })
            .then((data) => setMonthSlots(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast?.({ type: 'error', message: 'Nao foi possivel carregar a agenda.' });
                }
            })
            .finally(() => setLoadingAgendamento(false));

        return () => controller.abort();
    }, [currentMonth, onToast, selectedPsychologist, step]);

    useEffect(() => {
        if (!selectedPsychologist || !selectedDateKey || step !== 'agenda') return undefined;

        const controller = new AbortController();
        schedulingApi.listAvailableSlots({
            psicologoId: selectedPsychologist.id,
            data: selectedDateKey,
            signal: controller.signal,
        })
            .then((data) => setDaySlots((data || []).filter((slot) => new Date(getSlotInicio(slot)).getTime() > Date.now())))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast?.({ type: 'error', message: 'Nao foi possivel carregar os horarios.' });
                }
            });

        return () => controller.abort();
    }, [onToast, selectedDateKey, selectedPsychologist, step]);

    function openAgenda(psychologist) {
        setSelectedPsychologist(psychologist);
        setSelectedDateKey(null);
        setSelectedSlot(null);
        setStep('agenda');
    }

    function resetSchedule() {
        setStep('search');
        setSelectedPsychologist(null);
        setSelectedDateKey(null);
        setSelectedSlot(null);
        setDaySlots([]);
        setObservacoes('');
        setTipoAtendimento('ONLINE');
        setBookedConsulta(null);
    }

    function selectDate(dateKey) {
        setSelectedDateKey(dateKey);
        setSelectedSlot(null);
        setDaySlots([]);
    }

    async function confirmSchedule() {
        if (!selectedPsychologist || !selectedSlot) return;

        setSubmittingAgendamento(true);
        try {
            await schedulingApi.scheduleConsultation({
                psicologoId: selectedPsychologist.id,
                inicioEm: getSlotInicio(selectedSlot),
                tipoAtendimento,
                observacoes: observacoes.trim() || null,
            });
            setBookedConsulta({
                psicologoNome: selectedPsychologist.nome,
                inicioEm: getSlotInicio(selectedSlot),
                tipoAtendimento,
            });
            setStep('success');
            onScheduled?.();
        } catch {
            onToast?.({ type: 'error', message: 'Esse horario nao esta mais disponivel. Escolha outro horario.' });
        } finally {
            setSubmittingAgendamento(false);
        }
    }

    function goHome() {
        resetSchedule();
        onNavigate?.('schedule');
    }

    return {
        step,
        setStep,
        selectedPsychologist,
        currentMonth,
        setCurrentMonth,
        availableDateKeys,
        selectedDateKey,
        daySlots,
        selectedSlot,
        setSelectedSlot,
        tipoAtendimento,
        setTipoAtendimento,
        observacoes,
        setObservacoes,
        bookedConsulta,
        loadingAgendamento: activeView === 'schedule' && loadingAgendamento,
        submittingAgendamento,
        openAgenda,
        resetSchedule,
        selectDate,
        confirmSchedule,
        goHome,
    };
}
