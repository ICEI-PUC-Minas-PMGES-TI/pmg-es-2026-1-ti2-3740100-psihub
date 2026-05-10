import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock3, Loader2, Save, Trash2, X } from 'lucide-react';
import { schedulingApi } from '../../api/schedulingApi.js';
import { addDays, formatDate, formatDateTime, formatTime, toIsoDate } from '../../utils/date.js';

const days = [
    { value: 'SEGUNDA', label: 'Segunda' },
    { value: 'TERCA', label: 'Terca' },
    { value: 'QUARTA', label: 'Quarta' },
    { value: 'QUINTA', label: 'Quinta' },
    { value: 'SEXTA', label: 'Sexta' },
    { value: 'SABADO', label: 'Sabado' },
    { value: 'DOMINGO', label: 'Domingo' },
];

const statusLabels = {
    DISPONIVEL: 'Disponível',
    RESERVADO: 'Reservado',
    BLOQUEADO: 'Indisponível',
    CANCELADO: 'Removido',
};

const consultationStatusLabels = {
    AGENDADA: 'Agendada',
    CONFIRMADA: 'Confirmada',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluída',
};

const WEEK_START_HOUR = 7;
const WEEK_END_HOUR = 22;
const WEEK_SLOT_MINUTES = 30;
const LIST_RANGE_DAYS = 60;

export function PsychologistDashboard({ activeView, onToast }) {
    if (activeView === 'agenda') {
        return <AgendaManagement onToast={onToast} />;
    }

    return <AvailabilityForm onToast={onToast} />;
}

function AvailabilityForm({ onToast }) {
    const [selectedDays, setSelectedDays] = useState(['SEGUNDA']);
    const [horaInicio, setHoraInicio] = useState('08:00');
    const [horaFim, setHoraFim] = useState('12:00');
    const [duracao, setDuracao] = useState(50);
    const [submitting, setSubmitting] = useState(false);

    const isValid = selectedDays.length > 0 && horaInicio && horaFim && horaFim > horaInicio && Number(duracao) > 0;

    function toggleDay(day) {
        setSelectedDays((current) => {
            if (current.includes(day)) {
                return current.filter((item) => item !== day);
            }
            return [...current, day];
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!isValid) {
            onToast({ type: 'error', message: 'Preencha uma disponibilidade valida.' });
            return;
        }

        const today = new Date();
        setSubmitting(true);

        try {
            await schedulingApi.saveAvailability({
                diasSemana: selectedDays,
                horaInicio: `${horaInicio}:00`,
                horaFim: `${horaFim}:00`,
                duracaoSlotMinutos: Number(duracao),
                validoAPartirDe: toIsoDate(today),
                gerarAte: toIsoDate(addDays(today, 60)),
            });
            onToast({ type: 'success', message: 'Horários salvos e agenda atualizada.' });
        } catch {
            onToast({ type: 'error', message: 'Não foi possível salvar esses horários.' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="panel narrow-panel">
            <div className="panel__header">
                <div>
                    <p className="eyebrow">Disponibilidade</p>
                    <h2>Definir horários</h2>
                </div>
            </div>

            <form className="stack-form" onSubmit={handleSubmit}>
                <fieldset className="checkbox-group">
                    <legend>Dias disponiveis</legend>
                    <div>
                        {days.map((day) => (
                            <label className="check-card" key={day.value}>
                                <input
                                    type="checkbox"
                                    checked={selectedDays.includes(day.value)}
                                    onChange={() => toggleDay(day.value)}
                                />
                                <span>{day.label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <div className="form-grid">
                    <label>
                        Horário de início
                        <input type="time" value={horaInicio} onChange={(event) => setHoraInicio(event.target.value)} required />
                    </label>
                    <label>
                        Horario de fim
                        <input type="time" value={horaFim} onChange={(event) => setHoraFim(event.target.value)} required />
                    </label>
                </div>

                <label className="field">
                    Duracao da consulta
                    <input
                        type="number"
                        min="10"
                        step="5"
                        value={duracao}
                        onChange={(event) => setDuracao(event.target.value)}
                    />
                </label>

                <div className="inline-actions inline-actions--spread">
                    <button className="ghost-button" type="button" onClick={() => {
                        setSelectedDays(['SEGUNDA']);
                        setHoraInicio('08:00');
                        setHoraFim('12:00');
                        setDuracao(50);
                    }}>
                        Cancelar
                    </button>
                    <button className="primary-button primary-button--fit" type="submit" disabled={!isValid || submitting}>
                        {submitting ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
                        Salvar horários
                    </button>
                </div>
            </form>
        </section>
    );
}

function AgendaManagement({ onToast }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [refreshKey, setRefreshKey] = useState(0);
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [selectedSlotDetails, setSelectedSlotDetails] = useState(null);
    const [manualSlot, setManualSlot] = useState({
        data: toIsoDate(new Date()),
        horaInicio: '14:00',
        horaFim: '14:50',
    });

    useEffect(() => {
        const controller = new AbortController();
        const today = new Date();

        setLoading(true);
        schedulingApi.listMySlots({
            inicio: `${toIsoDate(today)}T00:00:00`,
            fim: `${toIsoDate(addDays(today, LIST_RANGE_DAYS))}T23:59:59`,
            signal: controller.signal,
        })
            .then((data) => setSlots(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast({ type: 'error', message: 'Não foi possível carregar a agenda.' });
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [onToast, refreshKey]);

    const sortedSlots = useMemo(() => {
        return [...slots].sort((first, second) => new Date(first.inicioEm) - new Date(second.inicioEm));
    }, [slots]);

    const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
    const weekTimeRows = useMemo(() => buildTimeRows(WEEK_START_HOUR, WEEK_END_HOUR, WEEK_SLOT_MINUTES), []);
    const weekSlots = useMemo(() => filterSlotsForRange(sortedSlots, weekStart, addDays(weekStart, 7)), [sortedSlots, weekStart]);
    const slotsByStart = useMemo(() => groupSlotsByStartTime(weekSlots), [weekSlots]);
    const weekRangeLabel = `${formatDate(weekStart)} - ${formatDate(addDays(weekStart, 6))}`;

    async function addSlot(event) {
        event.preventDefault();
        setSubmitting(true);

        try {
            await schedulingApi.createManualSlot({
                data: manualSlot.data,
                horaInicio: `${manualSlot.horaInicio}:00`,
                horaFim: `${manualSlot.horaFim}:00`,
            });
            setRefreshKey((current) => current + 1);
            onToast({ type: 'success', message: 'Horario adicionado.' });
        } catch {
            onToast({ type: 'error', message: 'Não foi possível adicionar esse horário.' });
        } finally {
            setSubmitting(false);
        }
    }

    async function removeSlot(slot) {
        setSubmitting(true);
        try {
            await schedulingApi.removeMySlot(slot.id);
            setRefreshKey((current) => current + 1);
            onToast({ type: 'success', message: 'Horário removido da agenda.' });
        } catch {
            onToast({ type: 'error', message: 'Não foi possível remover esse horário.' });
        } finally {
            setSubmitting(false);
        }
    }

    function selectWeekSlot(slot) {
        if (slot.status === 'DISPONIVEL') {
            setManualSlot({
                data: toIsoDate(new Date(slot.inicioEm)),
                horaInicio: formatTime(slot.inicioEm),
                horaFim: formatTime(slot.fimEm),
            });
            setViewMode('list');
            onToast({ type: 'success', message: 'Horário preenchido no formulário de novo horário.' });
            return;
        }

        setSelectedSlotDetails(slot);
    }

    return (
        <div className="stack-layout">
            <section className="panel">
                <div className="panel__header agenda-toolbar">
                    <div>
                        <p className="eyebrow">Agenda</p>
                        <h2>Adicionar horário</h2>
                    </div>
                    <div className="agenda-toggle" role="tablist" aria-label="Alternar visualização da agenda">
                        <button
                            className={viewMode === 'list' ? 'agenda-toggle__button agenda-toggle__button--active' : 'agenda-toggle__button'}
                            type="button"
                            onClick={() => setViewMode('list')}
                            aria-pressed={viewMode === 'list'}
                        >
                            <CalendarDays size={16} />
                            Lista
                        </button>
                        <button
                            className={viewMode === 'week' ? 'agenda-toggle__button agenda-toggle__button--active' : 'agenda-toggle__button'}
                            type="button"
                            onClick={() => setViewMode('week')}
                            aria-pressed={viewMode === 'week'}
                        >
                            <Clock3 size={16} />
                            Semana
                        </button>
                    </div>
                </div>

                <form className="inline-form" onSubmit={addSlot}>
                    <label>
                        Data
                        <input
                            type="date"
                            min={toIsoDate(new Date())}
                            value={manualSlot.data}
                            onChange={(event) => setManualSlot((current) => ({ ...current, data: event.target.value }))}
                            required
                        />
                    </label>
                    <label>
                        Inicio
                        <input
                            type="time"
                            value={manualSlot.horaInicio}
                            onChange={(event) => setManualSlot((current) => ({ ...current, horaInicio: event.target.value }))}
                            required
                        />
                    </label>
                    <label>
                        Fim
                        <input
                            type="time"
                            value={manualSlot.horaFim}
                            onChange={(event) => setManualSlot((current) => ({ ...current, horaFim: event.target.value }))}
                            required
                        />
                    </label>
                    <button className="primary-button primary-button--fit" type="submit" disabled={submitting}>
                        {submitting ? <Loader2 className="spin" size={17} /> : <CalendarPlus size={17} />}
                        Adicionar horário
                    </button>
                </form>
            </section>

            <section className="panel">
                <div className="panel__header">
                    <div>
                        <p className="eyebrow">Horários</p>
                        <h2>{viewMode === 'list' ? 'Gerenciar agenda' : `Semana de ${weekRangeLabel}`}</h2>
                    </div>
                    {viewMode === 'week' && (
                        <div className="week-nav">
                            <button className="ghost-button" type="button" onClick={() => setWeekStart((current) => addDays(current, -7))}>
                                <ChevronLeft size={16} />
                                Semana anterior
                            </button>
                            <button className="ghost-button" type="button" onClick={() => setWeekStart(startOfWeek(new Date()))}>
                                Hoje
                            </button>
                            <button className="ghost-button" type="button" onClick={() => setWeekStart((current) => addDays(current, 7))}>
                                Próxima semana
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {loading && <LoadingState />}

                {!loading && viewMode === 'list' && sortedSlots.length === 0 && (
                    <div className="empty-state">Nenhum horário cadastrado.</div>
                )}

                {!loading && viewMode === 'list' && sortedSlots.length > 0 && (
                    <div className="data-table" role="table">
                        <div className="data-table__row data-table__row--head" role="row">
                            <span>Data</span>
                            <span>Horario</span>
                            <span>Status</span>
                            <span />
                        </div>
                        {sortedSlots.map((slot) => {
                            const occupied = slot.status === 'RESERVADO';
                            const isReserved = slot.status === 'RESERVADO';
                            return (
                                <div className="agenda-row data-table__row" role="row" key={slot.id}>
                                    <span>{formatDateTime(slot.inicioEm).split(',')[0]}</span>
                                    <span>{formatTime(slot.inicioEm)} - {formatTime(slot.fimEm)}</span>
                                    <span>
                                        <span className={isReserved ? 'status-badge status-badge--reserved' : 'status-badge status-badge--available'}>
                                            {statusLabels[slot.status] || slot.status}
                                        </span>
                                        {isReserved && (
                                            <span className="agenda-row__meta">
                                                <strong>{slot.pacienteNome}</strong>
                                                <span>{slot.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}</span>
                                            </span>
                                        )}
                                        {isReserved && (
                                            <div className="agenda-row__tooltip" role="tooltip">
                                                <strong>{slot.pacienteNome}</strong>
                                                <span>{slot.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}</span>
                                                <p>{slot.observacoes || 'Sem observações.'}</p>
                                            </div>
                                        )}
                                    </span>
                                    <button className="ghost-button" type="button" disabled={occupied || submitting} onClick={() => removeSlot(slot)}>
                                        <Trash2 size={16} />
                                        Remover horário
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && viewMode === 'week' && (
                    <WeekAgendaGrid
                        weekStart={weekStart}
                        days={weekDays}
                        timeRows={weekTimeRows}
                        slotsByStart={slotsByStart}
                        onSlotClick={selectWeekSlot}
                    />
                )}
            </section>

            {selectedSlotDetails && (
                <SlotDetailsModal slot={selectedSlotDetails} onClose={() => setSelectedSlotDetails(null)} />
            )}
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

function WeekAgendaGrid({ days, timeRows, slotsByStart, onSlotClick }) {
    return (
        <div className="week-agenda">
            <div className="week-agenda__header">
                <span className="week-agenda__time-label" />
                {days.map((date) => {
                    const isToday = isSameDate(date, toIsoDate(new Date()));
                    return (
                        <div className={isToday ? 'week-agenda__day week-agenda__day--today' : 'week-agenda__day'} key={toIsoDate(date)}>
                            <strong>{weekdayLabel(date)}</strong>
                            <span>{formatDate(date).slice(0, 5)}</span>
                        </div>
                    );
                })}
            </div>

            <div className="week-agenda__body">
                <div className="week-agenda__times">
                    {timeRows.map((row) => (
                        <div className="week-agenda__time-cell" key={row.label}>
                            {row.label}
                        </div>
                    ))}
                </div>

                {days.map((date) => {
                    const dateKey = toIsoDate(date);
                    const daySlots = slotsByStart.get(dateKey) || [];
                    return (
                        <div className="week-agenda__column" key={dateKey}>
                            {timeRows.map((row, index) => {
                                const slot = daySlots.find((item) => item.startKey === row.key);
                                const clickable = Boolean(slot && (slot.status === 'DISPONIVEL' || slot.consultaStatus));
                                return (
                                    <button
                                        className={[
                                            'week-agenda__slot',
                                            clickable ? 'week-agenda__slot--interactive' : 'week-agenda__slot--unavailable',
                                            slot ? getAgendaToneClass(slot) : '',
                                        ].filter(Boolean).join(' ')}
                                        type="button"
                                        key={row.key}
                                        onClick={() => slot && clickable && onSlotClick(slot)}
                                        disabled={!clickable}
                                        title={slot ? `${slot.pacienteNome || 'Horário disponível'} - ${formatTime(slot.inicioEm)}-${formatTime(slot.fimEm)}` : 'Fora da disponibilidade'}
                                        style={{
                                            top: `${index * 44}px`,
                                            height: slot ? `${Math.max(44, Math.ceil(slot.durationMinutes / 30) * 44)}px` : '44px',
                                        }}
                                    >
                                        {slot ? (
                                            <>
                                                <span className="agenda-block">
                                                    {slot.pacienteNome || 'Disponível'}
                                                </span>
                                                <strong>{formatTime(slot.inicioEm)} - {formatTime(slot.fimEm)}</strong>
                                                {slot.tipoAtendimento && (
                                                    <span className="status-badge status-badge--type">
                                                        {slot.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}
                                                    </span>
                                                )}
                                                {slot.status === 'DISPONIVEL' ? (
                                                    <span className="status-badge status-badge--available">Disponível</span>
                                                ) : (
                                                    <span className="status-badge status-badge--reserved">Reservado</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="week-agenda__unavailable-label">Indisponível</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SlotDetailsModal({ slot, onClose }) {
    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Detalhes da consulta" onClick={(event) => event.stopPropagation()}>
                <div className="modal-panel__header">
                    <div>
                        <p className="eyebrow">Consulta</p>
                        <h3>{slot.pacienteNome}</h3>
                    </div>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </div>

                <dl className="details-list">
                    <div>
                        <dt>Status</dt>
                        <dd>{consultationStatusLabels[slot.consultaStatus] || slot.consultaStatus || 'Reservado'}</dd>
                    </div>
                    <div>
                        <dt>Tipo</dt>
                        <dd>{slot.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}</dd>
                    </div>
                    <div>
                        <dt>Horário</dt>
                        <dd>{formatTime(slot.inicioEm)} - {formatTime(slot.fimEm)}</dd>
                    </div>
                    <div>
                        <dt>Observações</dt>
                        <dd>{slot.observacoes || 'Sem observações.'}</dd>
                    </div>
                    {slot.motivoCancelamento && (
                        <div>
                            <dt>Motivo do cancelamento</dt>
                            <dd>{slot.motivoCancelamento}</dd>
                        </div>
                    )}
                </dl>
            </div>
        </div>
    );
}

function getAgendaToneClass(slot) {
    if (slot.consultaStatus === 'EM_ANDAMENTO') return 'week-agenda__slot--in-progress';
    if (slot.consultaStatus === 'CONCLUIDA') return 'week-agenda__slot--completed';
    if (slot.status === 'RESERVADO') return 'week-agenda__slot--scheduled';
    if (slot.status === 'BLOQUEADO' || slot.status === 'CANCELADO') return 'week-agenda__slot--blocked';
    return 'week-agenda__slot--available';
}

function buildWeekDays(startDate) {
    return Array.from({ length: 7 }, (_, index) => addDays(startDate, index));
}

function buildTimeRows(startHour, endHour, minutesStep) {
    const rows = [];
    const base = new Date();
    base.setHours(startHour, 0, 0, 0);
    const end = new Date();
    end.setHours(endHour, 0, 0, 0);

    let cursor = new Date(base);
    while (cursor < end) {
        const next = new Date(cursor);
        next.setMinutes(next.getMinutes() + minutesStep);
        rows.push({
            key: toIsoDate(cursor) + 'T' + formatHoursMinutes(cursor),
            label: formatHoursMinutes(cursor),
            span: minutesStep / 30,
        });
        cursor = next;
    }

    return rows;
}

function filterSlotsForRange(slots, startDate, endDate) {
    return slots.filter((slot) => {
        const slotDate = new Date(slot.inicioEm);
        return slotDate >= startDate && slotDate < endDate;
    });
}

function groupSlotsByStartTime(slots) {
    const grouped = new Map();

    slots.forEach((slot) => {
        const dateKey = toIsoDate(new Date(slot.inicioEm));
        const startKey = dateKey + 'T' + formatHoursMinutes(new Date(slot.inicioEm));
        const entry = {
            ...slot,
            startKey,
            durationMinutes: Math.max(30, Math.round((new Date(slot.fimEm).getTime() - new Date(slot.inicioEm).getTime()) / 60000)),
        };

        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, []);
        }

        grouped.get(dateKey).push(entry);
    });

    return grouped;
}

function startOfWeek(date) {
    const value = new Date(date);
    value.setDate(value.getDate() - value.getDay());
    value.setHours(0, 0, 0, 0);
    return value;
}

function isSameDate(first, secondKey) {
    return toIsoDate(first) === secondKey;
}

function weekdayLabel(date) {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', '').replace(/^./, (letter) => letter.toUpperCase());
}

function formatHoursMinutes(date) {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
}
