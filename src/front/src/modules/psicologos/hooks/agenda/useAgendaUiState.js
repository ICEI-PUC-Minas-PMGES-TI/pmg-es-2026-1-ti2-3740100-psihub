import { useState } from 'react';
import { startOfWeek } from '../../utils/agenda.utils';

/**
 * Centraliza apenas o estado visual local da agenda do psicologo.
 *
 * @returns {Object} estado e setters de modais, semana e campos temporarios
 */
export function useAgendaUiState() {
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [availabilityModal, setAvailabilityModal] = useState(null);
    const [singleDayAvailabilityModal, setSingleDayAvailabilityModal] = useState(null);
    const [cellActionMenu, setCellActionMenu] = useState(null);
    const [scheduleConsultationModal, setScheduleConsultationModal] = useState(null);
    const [consultationModal, setConsultationModal] = useState(null);
    const [unblockSlotModal, setUnblockSlotModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    return {
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
    };
}
