import { useState } from 'react';
import { CalendarioConsultas } from './CalendarioConsultas';
import { ListaConsultasRecentes } from './ListaConsultasRecentes';
import { ModalAgendarConsulta } from './ModalAgendarConsulta';
import { AvaliacaoConsultaModal } from './AvaliacaoConsultaModal';
import { ModalConfirmacaoAgendamento } from './ModalConfirmacaoAgendamento';
import { SearchPsychologistView } from './SearchPsychologistView';
import { usePatientAgendamento } from '../hooks/usePatientAgendamento';
import { usePatientCancelamento } from '../hooks/usePatientCancelamento';
import { usePatientDashboardData } from '../hooks/usePatientDashboardData';

export function PatientDashboard({ activeView, patientName, onNavigate, onToast }) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [showHistory, setShowHistory] = useState(false);
    const [avaliacaoConsulta, setAvaliacaoConsulta] = useState(null);
    const refresh = () => setRefreshKey((current) => current + 1);
    const data = usePatientDashboardData({ activeView, showHistory, refreshKey, onToast });
    const agendamento = usePatientAgendamento({ activeView, onNavigate, onToast, onScheduled: refresh });
    const cancelamento = usePatientCancelamento({ onToast, onCanceled: refresh });
    const loading = data.loadingDashboardData || agendamento.loadingAgendamento;

    if (activeView === 'appointments') {
        return (
            <>
                <ListaConsultasRecentes
                    appointments={data.appointments}
                    loading={loading}
                    canceling={cancelamento.canceling}
                    cancelReason={cancelamento.cancelReason}
                    submitting={cancelamento.submittingCancelamento}
                    showHistory={showHistory}
                    onToggleHistory={() => setShowHistory((h) => !h)}
                    onStartCancel={cancelamento.setCanceling}
                    onCancelReasonChange={cancelamento.setCancelReason}
                    onAbortCancel={cancelamento.abortCancel}
                    onConfirmCancel={cancelamento.confirmCancel}
                    onStartAvaliacao={setAvaliacaoConsulta}
                />
                {avaliacaoConsulta && (
                    <AvaliacaoConsultaModal
                        consulta={avaliacaoConsulta}
                        onClose={() => setAvaliacaoConsulta(null)}
                        onSuccess={refresh}
                        onToast={onToast}
                    />
                )}
            </>
        );
    }

    if (agendamento.step === 'agenda' && agendamento.selectedPsychologist) {
        return (
            <CalendarioConsultas
                psychologist={agendamento.selectedPsychologist}
                currentMonth={agendamento.currentMonth}
                loading={loading}
                availableDateKeys={agendamento.availableDateKeys}
                selectedDateKey={agendamento.selectedDateKey}
                daySlots={agendamento.daySlots}
                selectedSlot={agendamento.selectedSlot}
                onMonthChange={agendamento.setCurrentMonth}
                onDateSelect={agendamento.selectDate}
                onSlotSelect={agendamento.setSelectedSlot}
                onContinue={() => agendamento.setStep('confirm')}
                onBack={agendamento.resetSchedule}
            />
        );
    }

    if (agendamento.step === 'confirm') {
        return (
            <ModalAgendarConsulta
                patientName={patientName}
                psychologist={agendamento.selectedPsychologist}
                slot={agendamento.selectedSlot}
                tipoAtendimento={agendamento.tipoAtendimento}
                observacoes={agendamento.observacoes}
                submitting={agendamento.submittingAgendamento}
                onTipoAtendimentoChange={agendamento.setTipoAtendimento}
                onObservacoesChange={agendamento.setObservacoes}
                onConfirm={agendamento.confirmSchedule}
                onBack={() => agendamento.setStep('agenda')}
            />
        );
    }

    if (agendamento.step === 'success') {
        return <ModalConfirmacaoAgendamento consulta={agendamento.bookedConsulta} onClose={agendamento.goHome} />;
    }

    return <SearchPsychologistView psychologists={data.psychologists} loading={loading} onOpenAgenda={agendamento.openAgenda} />;
}
