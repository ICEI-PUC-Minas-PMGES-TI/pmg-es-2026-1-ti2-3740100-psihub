import { useMemo } from 'react';
import { CalendarCheck } from 'lucide-react';
import { formatDateTime, toIsoDate } from '@/shared/utils/date.utils';
import { patientStatusLabels } from '../../utils/patient.utils';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { ModalCancelarConsulta } from '../ModalCancelarConsulta';

export function ListaConsultasRecentes({
    appointments,
    loading,
    canceling,
    cancelReason,
    submitting,
    showHistory,
    onToggleHistory,
    onStartCancel,
    onCancelReasonChange,
    onAbortCancel,
    onConfirmCancel,
}) {
    const sortedAppointments = useMemo(() => {
        const list = [...appointments];
        list.sort((a, b) => {
            const diff = new Date(a.inicioEm) - new Date(b.inicioEm);
            return showHistory ? -diff : diff;
        });
        return list;
    }, [appointments, showHistory]);

    const todayKey = toIsoDate(new Date());
    let todaySepInserted = false;

    return (
        <div className="psihome">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">Consultas</p>
                    <p className="agenda-page__subtitle">Acompanhe e gerencie seus agendamentos de atendimento.</p>
                </div>
            </header>
            <section className="panel">
                <div className="panel__header">
                    <h2>Minhas Consultas</h2>
                    <button className="ghost-button" type="button" onClick={onToggleHistory}>
                        {showHistory ? 'Ocultar histórico' : 'Ver histórico'}
                    </button>
                </div>

                {loading && <LoadingState />}
                {!loading && sortedAppointments.length === 0 && (
                    <EmptyState
                        icon={CalendarCheck}
                        title={showHistory ? 'Nenhuma consulta encontrada no historico.' : 'Você ainda não tem consultas agendadas.'}
                    />
                )}

                {!loading && sortedAppointments.length > 0 && (
                    <div className="appointment-list">
                        {sortedAppointments.map((appointment) => {
                            const canCancel = !['CANCELADA', 'CONCLUIDA', 'FALTOU'].includes(appointment.status);
                            const isCanceling = canceling?.id === appointment.id;
                            const dateKey = appointment.inicioEm.slice(0, 10);
                            const showTodaySep = !showHistory && !todaySepInserted && dateKey === todayKey;
                            if (showTodaySep) todaySepInserted = true;

                            return (
                                <div key={appointment.id}>
                                    {showTodaySep && (
                                        <div className="appointment-list__today-separator">
                                            <span>Hoje</span>
                                        </div>
                                    )}
                                    <article className="appointment-card">
                                        <div className="appointment-card__main">
                                            <span className={`status-badge status-badge--${appointment.status.toLowerCase()}`}>
                                                {patientStatusLabels[appointment.status] || appointment.status}
                                            </span>
                                            <h3>{appointment.psicologoNome}</h3>
                                            <p>{formatDateTime(appointment.inicioEm)}</p>
                                        </div>

                                        {isCanceling ? (
                                            <ModalCancelarConsulta
                                                appointment={appointment}
                                                cancelReason={cancelReason}
                                                submitting={submitting}
                                                onCancelReasonChange={onCancelReasonChange}
                                                onAbortCancel={onAbortCancel}
                                                onConfirmCancel={onConfirmCancel}
                                            />
                                        ) : (
                                            canCancel && (
                                                <button className="ghost-button" type="button" onClick={() => onStartCancel(appointment)}>
                                                    Cancelar consulta
                                                </button>
                                            )
                                        )}
                                    </article>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
