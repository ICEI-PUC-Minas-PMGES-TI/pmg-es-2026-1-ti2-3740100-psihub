import { createElement, useEffect, useMemo, useState } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, Clock, Loader2, SearchX, X } from 'lucide-react';
import { schedulingApi } from '@/services/scheduling.service';
import {
    addDays,
    addMonths,
    buildCalendarDays,
    endExclusiveOfMonth,
    formatDate,
    formatDateTime,
    formatMonth,
    formatTime,
    isBeforeToday,
    startOfMonth,
    toIsoDate,
} from '@/shared/utils/date.utils';

const statusLabels = {
    AGENDADA: 'Agendada',
    CONFIRMADA: 'Confirmada',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada',
    FALTOU: 'Faltou',
};

function getSlotInicio(slot) {
    return slot?.inicioEm || slot?.inicio || null;
}

function getSlotKey(slot) {
    return slot?.id ?? getSlotInicio(slot);
}

export function PatientDashboard({ activeView, patientName, onNavigate, onToast }) {
    const [step, setStep] = useState('search');
    const [psychologists, setPsychologists] = useState([]);
    const [selectedPsychologist, setSelectedPsychologist] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
    const [monthSlots, setMonthSlots] = useState([]);
    const [selectedDateKey, setSelectedDateKey] = useState(null);
    const [daySlots, setDaySlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [tipoAtendimento, setTipoAtendimento] = useState('ONLINE');
    const [observacoes, setObservacoes] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [canceling, setCanceling] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showHistory, setShowHistory] = useState(false);

    const availableDateKeys = useMemo(() => {
        return new Set(
            monthSlots
                .filter((slot) => slot.status === 'DISPONIVEL' && new Date(getSlotInicio(slot)).getTime() > Date.now())
                .map((slot) => getSlotInicio(slot).slice(0, 10)),
        );
    }, [monthSlots]);

    useEffect(() => {
        if (activeView !== 'schedule') return undefined;

        const controller = new AbortController();
        setLoading(true);
        schedulingApi.listPsychologists(controller.signal)
            .then((data) => setPsychologists(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast({ type: 'error', message: 'Não foi possível carregar os profissionais.' });
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [activeView, onToast]);

    useEffect(() => {
        if (!selectedPsychologist || step !== 'agenda') return undefined;

        const controller = new AbortController();
        const inicio = `${toIsoDate(startOfMonth(currentMonth))}T00:00:00`;
        const fim = `${toIsoDate(endExclusiveOfMonth(currentMonth))}T00:00:00`;

        setLoading(true);
        schedulingApi.listPsychologistMonthSlots({
            psicologoId: selectedPsychologist.id,
            inicio,
            fim,
            signal: controller.signal,
        })
            .then((data) => setMonthSlots(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast({ type: 'error', message: 'Não foi possível carregar a agenda.' });
                }
            })
            .finally(() => setLoading(false));

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
                    onToast({ type: 'error', message: 'Não foi possível carregar os horários.' });
                }
            });

        return () => controller.abort();
    }, [onToast, selectedDateKey, selectedPsychologist, step]);

    useEffect(() => {
        if (activeView !== 'appointments') return undefined;

        const controller = new AbortController();
        const today = new Date();

        setLoading(true);
        schedulingApi.listConsultations({
            inicio: showHistory ? toIsoDate(addDays(today, -365)) : toIsoDate(today),
            fim: showHistory ? toIsoDate(addDays(today, 30)) : toIsoDate(addDays(today, 120)),
            historico: showHistory,
            signal: controller.signal,
        })
            .then((data) => setAppointments(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast({ type: 'error', message: 'Não foi possível carregar suas consultas.' });
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [activeView, onToast, refreshKey, showHistory]);

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
    }

    async function confirmSchedule() {
        if (!selectedPsychologist || !selectedSlot) return;

        setSubmitting(true);
        try {
            await schedulingApi.scheduleConsultation({
                psicologoId: selectedPsychologist.id,
                inicioEm: getSlotInicio(selectedSlot),
                tipoAtendimento,
                observacoes: observacoes.trim() || null,
            });
            setStep('success');
            setRefreshKey((current) => current + 1);
        } catch {
            onToast({ type: 'error', message: 'Esse horário não está mais disponível. Escolha outro horário.' });
        } finally {
            setSubmitting(false);
        }
    }

    async function confirmCancel(appointment) {
        setSubmitting(true);
        try {
            await schedulingApi.cancelConsultation({
                consultaId: appointment.id,
                motivoCancelamento: cancelReason.trim() || null,
            });
            setCanceling(null);
            setCancelReason('');
            setRefreshKey((current) => current + 1);
            onToast({ type: 'success', message: 'Consulta cancelada e horário liberado.' });
        } catch {
            onToast({ type: 'error', message: 'Não foi possível cancelar essa consulta.' });
        } finally {
            setSubmitting(false);
        }
    }

    if (activeView === 'appointments') {
        return (
            <AppointmentsView
                appointments={appointments}
                loading={loading}
                canceling={canceling}
                cancelReason={cancelReason}
                submitting={submitting}
                showHistory={showHistory}
                onToggleHistory={() => setShowHistory((h) => !h)}
                onStartCancel={setCanceling}
                onCancelReasonChange={setCancelReason}
                onAbortCancel={() => setCanceling(null)}
                onConfirmCancel={confirmCancel}
            />
        );
    }

    if (step === 'agenda' && selectedPsychologist) {
        return (
            <AgendaView
                psychologist={selectedPsychologist}
                currentMonth={currentMonth}
                loading={loading}
                availableDateKeys={availableDateKeys}
                selectedDateKey={selectedDateKey}
                daySlots={daySlots}
                selectedSlot={selectedSlot}
                onMonthChange={setCurrentMonth}
                onDateSelect={(dateKey) => {
                    setSelectedDateKey(dateKey);
                    setSelectedSlot(null);
                    setDaySlots([]);
                }}
                onSlotSelect={setSelectedSlot}
                onContinue={() => setStep('confirm')}
                onBack={resetSchedule}
            />
        );
    }

    if (step === 'confirm') {
        return (
            <ConfirmView
                patientName={patientName}
                psychologist={selectedPsychologist}
                slot={selectedSlot}
                tipoAtendimento={tipoAtendimento}
                observacoes={observacoes}
                submitting={submitting}
                onTipoAtendimentoChange={setTipoAtendimento}
                onObservacoesChange={setObservacoes}
                onConfirm={confirmSchedule}
                onBack={() => setStep('agenda')}
            />
        );
    }

    if (step === 'success') {
        return (
            <SuccessView
                psychologist={selectedPsychologist}
                slot={selectedSlot}
                onHome={() => {
                    resetSchedule();
                    onNavigate('schedule');
                }}
            />
        );
    }

    return <SearchPsychologistView psychologists={psychologists} loading={loading} onOpenAgenda={openAgenda} />;
}

function SearchPsychologistView({ psychologists, loading, onOpenAgenda }) {
    return (
        <section className="panel">
            <div className="panel__header">
                <div>
                    <p className="eyebrow">Agendamento</p>
                    <h2>Buscar psicólogo</h2>
                </div>
            </div>

            {loading && <LoadingState />}

            {!loading && psychologists.length === 0 && (
                <EmptyState icon={SearchX} title="Nenhum psicólogo disponível no momento." />
            )}

            {!loading && psychologists.length > 0 && (
                <div className="data-table" role="table">
                    <div className="data-table__row data-table__row--head" role="row">
                        <span>Nome</span>
                        <span>Especialidade</span>
                        <span>Avaliação</span>
                        <span />
                    </div>
                    {psychologists.map((psychologist) => (
                        <div className="data-table__row" role="row" key={psychologist.id}>
                            <span>{psychologist.nome}</span>
                            <span>{psychologist.especialidades?.[0] || 'Psicologia'}</span>
                            <span>Ainda sem avaliacao</span>
                            <button className="secondary-button" type="button" onClick={() => onOpenAgenda(psychologist)}>
                                Ver agenda
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function AgendaView({
    psychologist,
    currentMonth,
    loading,
    availableDateKeys,
    selectedDateKey,
    daySlots,
    selectedSlot,
    onMonthChange,
    onDateSelect,
    onSlotSelect,
    onContinue,
    onBack,
}) {
    const days = buildCalendarDays(currentMonth);

    return (
        <div className="two-column-layout">
            <section className="panel">
                <div className="panel__header calendar-panel__header">
                    <button className="icon-button" type="button" onClick={() => onMonthChange(addMonths(currentMonth, -1))} aria-label="Mês anterior">
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <p className="eyebrow">{psychologist.nome}</p>
                        <h2>{formatMonth(currentMonth)}</h2>
                    </div>
                    <button className="icon-button" type="button" onClick={() => onMonthChange(addMonths(currentMonth, 1))} aria-label="Próximo mês">
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className="week-grid" aria-hidden="true">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((day) => <span key={day}>{day}</span>)}
                </div>
                <div className={loading ? 'calendar-grid calendar-grid--loading' : 'calendar-grid'}>
                    {days.map((date, index) => {
                        if (!date) return <span className="calendar-cell calendar-cell--empty" key={`empty-${index}`} />;

                        const dateKey = toIsoDate(date);
                        const past = isBeforeToday(date);
                        const available = availableDateKeys.has(dateKey);
                        const selected = selectedDateKey === dateKey;

                        return (
                            <button
                                className={[
                                    'calendar-cell',
                                    available ? 'calendar-cell--available' : '',
                                    selected ? 'calendar-cell--selected' : '',
                                ].filter(Boolean).join(' ')}
                                type="button"
                                disabled={past}
                                onClick={() => onDateSelect(dateKey)}
                                key={dateKey}
                            >
                                <span>{date.getDate()}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="panel">
                <div className="panel__header">
                    <div>
                        <p className="eyebrow">Horários</p>
                        <h2>{selectedDateKey ? formatDate(`${selectedDateKey}T00:00:00`) : 'Selecione uma data'}</h2>
                    </div>
                </div>

                {!selectedDateKey && <EmptyState icon={Clock} title="Escolha uma data futura no calendario." />}
                {selectedDateKey && daySlots.length === 0 && <EmptyState icon={Clock} title="Não há horários disponíveis nessa data." />}

                {daySlots.length > 0 && (
                    <div className="slot-grid">
                        {daySlots.map((slot) => (
                            <button
                                className={getSlotKey(selectedSlot) === getSlotKey(slot) ? 'slot-button slot-button--selected' : 'slot-button'}
                                type="button"
                                key={getSlotKey(slot)}
                                onClick={() => onSlotSelect(slot)}
                            >
                                <Clock size={16} />
                                {formatTime(getSlotInicio(slot))}
                            </button>
                        ))}
                    </div>
                )}

                <div className="inline-actions inline-actions--spread">
                    <button className="ghost-button" type="button" onClick={onBack}>Voltar</button>
                    <button className="primary-button primary-button--fit" type="button" disabled={!selectedSlot} onClick={onContinue}>
                        Selecionar horário
                    </button>
                </div>
            </section>
        </div>
    );
}

function ConfirmView({
    patientName,
    psychologist,
    slot,
    tipoAtendimento,
    observacoes,
    submitting,
    onTipoAtendimentoChange,
    onObservacoesChange,
    onConfirm,
    onBack,
}) {
    return (
        <section className="panel narrow-panel">
            <div className="panel__header">
                <div>
                    <p className="eyebrow">Confirmação</p>
                    <h2>Resumo da consulta</h2>
                </div>
            </div>

            <dl className="summary-list">
                <div><dt>Paciente</dt><dd>{patientName}</dd></div>
                <div><dt>Psicólogo</dt><dd>{psychologist.nome}</dd></div>
                <div><dt>Data e horário</dt><dd>{formatDateTime(getSlotInicio(slot))}</dd></div>
            </dl>

            <label className="field">
                Tipo de consulta
                <select value={tipoAtendimento} onChange={(event) => onTipoAtendimentoChange(event.target.value)}>
                    <option value="ONLINE">Online</option>
                    <option value="PRESENCIAL">Presencial</option>
                </select>
            </label>

            <label className="field">
                Observacoes
                <textarea rows={4} maxLength={300} value={observacoes} onChange={(event) => onObservacoesChange(event.target.value)} />
            </label>

            <div className="inline-actions inline-actions--spread">
                <button className="ghost-button" type="button" onClick={onBack}>Cancelar</button>
                <button className="primary-button primary-button--fit" type="button" disabled={submitting} onClick={onConfirm}>
                    {submitting ? <Loader2 className="spin" size={17} /> : <CalendarCheck size={17} />}
                    Confirmar agendamento
                </button>
            </div>
        </section>
    );
}

function SuccessView({ psychologist, slot, onHome }) {
    return (
        <section className="panel narrow-panel success-panel">
            <CalendarCheck size={42} />
            <h2>Consulta agendada com sucesso</h2>
            <p>{formatDateTime(getSlotInicio(slot))} com {psychologist.nome}</p>
            <button className="primary-button primary-button--fit" type="button" onClick={onHome}>Voltar ao início</button>
        </section>
    );
}

function AppointmentsView({
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
        <section className="panel">
            <div className="panel__header">
                <div>
                    <p className="eyebrow">Consultas</p>
                    <h2>Minhas consultas</h2>
                </div>
                <button className="ghost-button" type="button" onClick={onToggleHistory}>
                    {showHistory ? 'Ocultar histórico' : 'Ver histórico'}
                </button>
            </div>

            {loading && <LoadingState />}
            {!loading && sortedAppointments.length === 0 && (
                <EmptyState
                    icon={CalendarCheck}
                    title={showHistory ? 'Nenhuma consulta encontrada no histórico.' : 'Você ainda não tem consultas agendadas.'}
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
                                            {statusLabels[appointment.status] || appointment.status}
                                        </span>
                                        <h3>{appointment.psicologoNome}</h3>
                                        <p>{formatDateTime(appointment.inicioEm)}</p>
                                    </div>

                                    {isCanceling ? (
                                        <div className="cancel-box">
                                            <textarea
                                                rows={2}
                                                maxLength={300}
                                                value={cancelReason}
                                                onChange={(event) => onCancelReasonChange(event.target.value)}
                                            />
                                            <div className="inline-actions">
                                                <button className="danger-button" type="button" disabled={submitting} onClick={() => onConfirmCancel(appointment)}>
                                                    <X size={16} />
                                                    Confirmar cancelamento
                                                </button>
                                                <button className="ghost-button" type="button" onClick={onAbortCancel}>Voltar</button>
                                            </div>
                                        </div>
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
    );
}

function EmptyState({ icon: Icon, title }) {
    return (
        <div className="empty-state">
            {createElement(Icon, { size: 22 })}
            <span>{title}</span>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="loading-rows">
            <span />
            <span />
            <span />
        </div>
    );
}
