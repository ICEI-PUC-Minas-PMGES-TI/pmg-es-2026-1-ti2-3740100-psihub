import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, Download, Edit3, Loader2, Save, Search, Trash2, X } from 'lucide-react';
import { schedulingApi } from '../../api/schedulingApi.js';
import { addDays, formatDate, formatTime, toIsoDate } from '../../utils/date.js';

const DAY_ORDER = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];
const DAY_LABELS = {
    SEGUNDA: 'Seg',
    TERCA: 'Ter',
    QUARTA: 'Qua',
    QUINTA: 'Qui',
    SEXTA: 'Sex',
    SABADO: 'Sáb',
    DOMINGO: 'Dom',
};
const DAY_FULL_LABELS = {
    SEGUNDA: 'Segunda',
    TERCA: 'Terça',
    QUARTA: 'Quarta',
    QUINTA: 'Quinta',
    SEXTA: 'Sexta',
    SABADO: 'Sábado',
    DOMINGO: 'Domingo',
};
const DAY_OPTIONS = DAY_ORDER.map((value) => ({ value, label: DAY_FULL_LABELS[value] }));
const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Todos' },
    { value: 'AGENDADA', label: 'Agendada' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
    { value: 'CANCELADA', label: 'Cancelada' },
];
const TYPE_OPTIONS = [
    { value: 'ALL', label: 'Todos' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'PRESENCIAL', label: 'Presencial' },
];
const DEFAULT_DURATION = 50;
const CALENDAR_START_HOUR = 7;
const CALENDAR_END_HOUR = 22;
const CALENDAR_SLOT_MINUTES = 30;
const CONSULTATION_PAGE_SIZE = 8;
const MANUAL_SLOT_RANGE_DAYS = 60;
const CONSULTATION_RANGE_PAST_DAYS = 90;
const CONSULTATION_RANGE_FUTURE_DAYS = 180;

export function PsychologistAgendaPage({ onToast }) {
    const [availabilityRules, setAvailabilityRules] = useState([]);
    const [manualSlots, setManualSlots] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingConsultations, setLoadingConsultations] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [availabilityModal, setAvailabilityModal] = useState(null);
    const [singleDayAvailabilityModal, setSingleDayAvailabilityModal] = useState(null);
    const [cellActionMenu, setCellActionMenu] = useState(null);
    const [scheduleConsultationModal, setScheduleConsultationModal] = useState(null);
    const [consultationModal, setConsultationModal] = useState(null);
    const [unblockSlotModal, setUnblockSlotModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelSubmitting, setCancelSubmitting] = useState(false);
    const [availabilitySaving, setAvailabilitySaving] = useState(false);
    const [singleDayAvailabilitySaving, setSingleDayAvailabilitySaving] = useState(false);
    const [scheduleConsultationSaving, setScheduleConsultationSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [consultationPage, setConsultationPage] = useState(1);

    useEffect(() => {
        const controller = new AbortController();
        setLoadingAvailability(true);

        schedulingApi.listMyAvailability(controller.signal)
            .then((data) => setAvailabilityRules(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('[PsiHub] Erro ao carregar disponibilidade semanal do psicólogo', error);
                    onToast?.({ type: 'error', message: 'Não foi possível carregar sua disponibilidade semanal.' });
                }
            })
            .finally(() => setLoadingAvailability(false));

        return () => controller.abort();
    }, [onToast, refreshKey]);

    useEffect(() => {
        const controller = new AbortController();
        const today = new Date();
        setLoadingSlots(true);

        schedulingApi.listMySlots({
            inicio: `${toIsoDate(addDays(today, -MANUAL_SLOT_RANGE_DAYS))}T00:00:00`,
            fim: `${toIsoDate(addDays(today, MANUAL_SLOT_RANGE_DAYS))}T23:59:59`,
            signal: controller.signal,
        })
            .then((data) => setManualSlots(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast?.({ type: 'error', message: 'Não foi possível carregar os horários avulsos.' });
                }
            })
            .finally(() => setLoadingSlots(false));

        return () => controller.abort();
    }, [onToast, refreshKey]);

    useEffect(() => {
        const controller = new AbortController();
        const today = new Date();
        setLoadingConsultations(true);

        schedulingApi.listConsultations({
            inicio: toIsoDate(addDays(today, -CONSULTATION_RANGE_PAST_DAYS)),
            fim: toIsoDate(addDays(today, CONSULTATION_RANGE_FUTURE_DAYS)),
            signal: controller.signal,
        })
            .then((data) => setConsultations(data || []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onToast?.({ type: 'error', message: 'Não foi possível carregar suas consultas.' });
                }
            })
            .finally(() => setLoadingConsultations(false));

        return () => controller.abort();
    }, [onToast, refreshKey]);

    const normalizedRules = useMemo(() => latestRulesByDay(availabilityRules), [availabilityRules]);
    const availabilitySummary = useMemo(() => buildAvailabilitySummary(normalizedRules), [normalizedRules]);
    const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
    const calendarRows = useMemo(() => buildCalendarRows(CALENDAR_START_HOUR, CALENDAR_END_HOUR, CALENDAR_SLOT_MINUTES), []);
    const weekConsultations = useMemo(() => {
        const start = weekStart;
        const end = addDays(weekStart, 7);
        return consultations.filter((consultation) => {
            const date = new Date(consultation.inicioEm);
            return date >= start && date < end;
        });
    }, [consultations, weekStart]);

    const filteredConsultations = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return consultations
            .filter((consultation) => {
                if (statusFilter !== 'ALL' && consultation.status !== statusFilter) return false;
                if (typeFilter !== 'ALL' && consultation.tipoAtendimento !== typeFilter) return false;
                if (!normalizedQuery) return true;
                return normalizeText(consultation.pacienteNome).includes(normalizedQuery);
            })
            .sort((first, second) => new Date(first.inicioEm) - new Date(second.inicioEm));
    }, [consultations, searchQuery, statusFilter, typeFilter]);

    const pagedConsultations = useMemo(() => {
        const startIndex = (consultationPage - 1) * CONSULTATION_PAGE_SIZE;
        return filteredConsultations.slice(startIndex, startIndex + CONSULTATION_PAGE_SIZE);
    }, [consultationPage, filteredConsultations]);

    const consultationPages = Math.max(1, Math.ceil(filteredConsultations.length / CONSULTATION_PAGE_SIZE));
    const weekAvailabilityByDay = useMemo(() => buildWeekAvailability(weekDays, normalizedRules), [normalizedRules, weekDays]);
    const weekConsultationBlocks = useMemo(() => buildWeekBlocks(weekDays, weekConsultations), [weekConsultations, weekDays]);
    const weekBlockedSlots = useMemo(() => {
        const start = weekStart;
        const end = addDays(weekStart, 7);
        return manualSlots
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

    useEffect(() => {
        setConsultationPage(1);
    }, [searchQuery, statusFilter, typeFilter]);

    function refreshAll() {
        setRefreshKey((current) => current + 1);
    }

    async function handleAvailabilitySave(event) {
        event.preventDefault();
        if (!availabilityModal) return;

        if (availabilityModal.selectedDays.length === 0) {
            onToast?.({ type: 'error', message: 'Selecione ao menos um dia da semana.' });
            return;
        }

        setAvailabilitySaving(true);
        try {
            const result = await schedulingApi.saveAvailability({
                diasSemana: availabilityModal.selectedDays,
                horaInicio: `${availabilityModal.horaInicio}:00`,
                horaFim: `${availabilityModal.horaFim}:00`,
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
        } catch (error) {
            onToast?.({ type: 'error', message: 'Não foi possível salvar essa disponibilidade.' });
        } finally {
            setAvailabilitySaving(false);
        }
    }

    async function handleSingleDayAvailabilitySave(event) {
        event.preventDefault();
        if (!singleDayAvailabilityModal) return;

        setSingleDayAvailabilitySaving(true);
        try {
            const result = await schedulingApi.saveAvailability({
                diasSemana: [singleDayAvailabilityModal.dayKey],
                horaInicio: `${singleDayAvailabilityModal.horaInicio}:00`,
                horaFim: `${singleDayAvailabilityModal.horaFim}:00`,
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
        } catch (error) {
            onToast?.({ type: 'error', message: 'Não foi possível salvar essa disponibilidade.' });
        } finally {
            setSingleDayAvailabilitySaving(false);
        }
    }

    async function handleScheduleConsultation(event) {
        event.preventDefault();
        if (!scheduleConsultationModal) return;

        setScheduleConsultationSaving(true);
        try {
            await schedulingApi.scheduleConsultationAsPsychologist({
                pacienteId: Number(scheduleConsultationModal.pacienteId),
                slotConsultaId: scheduleConsultationModal.slotId,
                tipoAtendimento: scheduleConsultationModal.tipoAtendimento,
                observacoes: scheduleConsultationModal.observacoes || null,
            });

            onToast?.({ type: 'success', message: 'Consulta agendada com sucesso.' });
            setScheduleConsultationModal(null);
            refreshAll();
        } catch (error) {
            onToast?.({ type: 'error', message: 'Não foi possível agendar essa consulta.' });
        } finally {
            setScheduleConsultationSaving(false);
        }
    }

    async function handleCancelConsultation() {
        if (!consultationModal) return;

        setCancelSubmitting(true);
        try {
            await schedulingApi.cancelConsultation({
                consultaId: consultationModal.id,
                motivoCancelamento: cancelReason.trim() || null,
            });
            onToast?.({ type: 'success', message: 'Consulta cancelada e horário liberado.' });
            setConsultationModal(null);
            setCancelReason('');
            refreshAll();
        } catch (error) {
            onToast?.({ type: 'error', message: 'Não foi possível cancelar essa consulta.' });
        } finally {
            setCancelSubmitting(false);
        }
    }

    async function handleRemoveSlot(slot) {
        const confirmed = window.confirm('Remover este horário da agenda?');
        if (!confirmed) return;

        try {
            await schedulingApi.removeMySlot(slot.id);
            onToast?.({ type: 'success', message: 'Horário removido da agenda.' });
            refreshAll();
        } catch (error) {
            onToast?.({ type: 'error', message: 'Não foi possível remover esse horário.' });
        }
    }

    function openCellActionMenu(date, minutesFromMidnight) {
        setCellActionMenu({ date, minutesFromMidnight, loading: null });
    }

    async function handleCellActionSchedule() {
        if (!cellActionMenu) return;
        const { date, minutesFromMidnight } = cellActionMenu;
        const start = minutesToTimeLabel(minutesFromMidnight);
        const end = minutesToTimeLabel(minutesFromMidnight + DEFAULT_DURATION);

        setCellActionMenu((current) => ({ ...current, loading: 'schedule' }));
        try {
            const slot = await schedulingApi.createManualSlot({
                data: toIsoDate(date),
                horaInicio: `${start}:00`,
                horaFim: `${end}:00`,
            });
            setCellActionMenu(null);
            setScheduleConsultationModal({
                slotId: slot.id,
                data: toIsoDate(date),
                horaInicio: start,
                horaFim: end,
                pacienteId: null,
                pacienteNome: '',
                tipoAtendimento: 'ONLINE',
                observacoes: '',,
            });
        } catch (error) {
            onToast?.({ type: 'error', message: error?.message || 'Não foi possível criar o horário.' });
            setCellActionMenu(null);
        }
    }

    async function handleCellActionBlock() {
        if (!cellActionMenu) return;
        const { date, minutesFromMidnight } = cellActionMenu;
        const start = minutesToTimeLabel(minutesFromMidnight);
        const end = minutesToTimeLabel(minutesFromMidnight + DEFAULT_DURATION);

        setCellActionMenu((current) => ({ ...current, loading: 'block' }));
        try {
            const slot = await schedulingApi.createManualSlot({
                data: toIsoDate(date),
                horaInicio: `${start}:00`,
                horaFim: `${end}:00`,
            });
            await schedulingApi.blockMySlot(slot.id);
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
            onToast?.({ type: 'error', message: 'Não foi possível remover o bloqueio.' });
        }
    }

    function exportFilteredConsultations() {
        if (filteredConsultations.length === 0) {
            onToast?.({ type: 'error', message: 'Não há consultas para exportar.' });
            return;
        }

        const rows = [
            ['Paciente', 'Data', 'Horário', 'Tipo', 'Status', 'Observações'],
            ...filteredConsultations.map((consultation) => [
                consultation.pacienteNome,
                formatDate(consultation.inicioEm),
                `${formatTime(consultation.inicioEm)} - ${formatTime(consultation.fimEm)}`,
                consultation.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online',
                consultationStatusLabel(consultation.status),
                consultation.observacoes || '',
            ]),
        ];

        const csv = rows
            .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `agenda-psihub-${toIsoDate(new Date())}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="agenda-page">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">Agenda</p>
                    <h1>Agenda</h1>
                    <p className="agenda-page__subtitle">Gerencie sua disponibilidade e consultas agendadas.</p>
                </div>
                <div className="agenda-page__actions">
                    <button className="secondary-button secondary-button--outline" type="button" onClick={exportFilteredConsultations}>
                        <Download size={17} />
                        Exportar
                    </button>
                </div>
            </header>

            <section className="panel agenda-section">
                <div className="panel__header">
                    <div>
                        <p className="eyebrow">Seção 1</p>
                        <h2>Minha Disponibilidade Semanal</h2>
                    </div>
                    <button className="secondary-button secondary-button--outline" type="button" onClick={() => setAvailabilityModal(defaultWeeklyAvailabilityModal(availabilitySummary))}>
                        <Edit3 size={17} />
                        Editar disponibilidade semanal
                    </button>
                </div>

                <div className="availability-grid">
                    {DAY_ORDER.map((dayKey) => {
                        const rule = availabilitySummary.find((item) => item.diaSemana === dayKey);
                        return (
                            <article className="availability-card" key={dayKey}>
                                <div className="availability-card__header">
                                    <strong>{DAY_FULL_LABELS[dayKey]}</strong>
                                    <button
                                        className="icon-button"
                                        type="button"
                                        onClick={() => setSingleDayAvailabilityModal(defaultSingleDayAvailabilityModal(dayKey, rule))}
                                        aria-label={`Editar disponibilidade de ${DAY_FULL_LABELS[dayKey]}`}
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </div>
                                <div className={rule?.ativo ? 'availability-card__hours' : 'availability-card__hours availability-card__hours--muted'}>
                                    {rule?.ativo ? `${formatClock(rule.horaInicio)} – ${formatClock(rule.horaFim)}` : 'Indisponível'}
                                </div>
                                <div className="availability-card__meta">Duração: {rule?.duracaoSlotMinutos || DEFAULT_DURATION} min</div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="panel agenda-section">
                <div className="panel__header">
                    <div>
                        <p className="eyebrow">Seção 2</p>
                        <h2>Lista de Consultas Agendadas</h2>
                    </div>
                    <div className="agenda-table__summary">
                        {filteredConsultations.length} consulta(s) encontrada(s)
                    </div>
                </div>

                <div className="agenda-table-filters">
                    <div className="agenda-filter-group">
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={statusFilter === option.value ? 'agenda-filter-button agenda-filter-button--active' : 'agenda-filter-button'}
                                onClick={() => setStatusFilter(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <div className="agenda-filter-group">
                        {TYPE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={typeFilter === option.value ? 'agenda-filter-button agenda-filter-button--active' : 'agenda-filter-button'}
                                onClick={() => setTypeFilter(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <label className="agenda-search">
                        <Search size={16} />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Buscar paciente"
                        />
                    </label>
                </div>

                {loadingConsultations && <LoadingState />}
                {!loadingConsultations && filteredConsultations.length === 0 && (
                    <div className="empty-state">Nenhuma consulta encontrada para os filtros selecionados.</div>
                )}
                {!loadingConsultations && filteredConsultations.length > 0 && (
                    <>
                        <div className="agenda-table">
                            <div className="agenda-table__row agenda-table__row--head">
                                <span>Paciente</span>
                                <span>Data</span>
                                <span>Horário</span>
                                <span>Tipo</span>
                                <span>Status</span>
                                <span>Ações</span>
                            </div>
                            {pagedConsultations.map((consultation) => (
                                <div className="agenda-table__row" key={consultation.id}>
                                    <span>{consultation.pacienteNome}</span>
                                    <span>{formatDate(consultation.inicioEm)}</span>
                                    <span>{formatTime(consultation.inicioEm)} - {formatTime(consultation.fimEm)}</span>
                                    <span>{consultation.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}</span>
                                    <span>
                                        <span className={`status-badge ${statusBadgeClass(consultation.status)}`}>
                                            {consultationStatusLabel(consultation.status)}
                                        </span>
                                    </span>
                                    <span className="agenda-table__actions">
                                        <button className="ghost-button" type="button" onClick={() => setConsultationModal(consultation)}>
                                            Ver detalhes
                                        </button>
                                        <button
                                            className="ghost-button"
                                            type="button"
                                            disabled={!canCancelConsultation(consultation)}
                                            onClick={() => {
                                                setConsultationModal(consultation);
                                                setCancelReason('');
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="agenda-pagination">
                            <button className="ghost-button" type="button" onClick={() => setConsultationPage((current) => Math.max(1, current - 1))} disabled={consultationPage === 1}>
                                Anterior
                            </button>
                            <span>Página {consultationPage} de {consultationPages}</span>
                            <button className="ghost-button" type="button" onClick={() => setConsultationPage((current) => Math.min(consultationPages, current + 1))} disabled={consultationPage >= consultationPages}>
                                Próxima
                            </button>
                        </div>
                    </>
                )}
            </section>

            <section className="panel agenda-section">
                <div className="panel__header">
                    <div>
                        <p className="eyebrow">Seção 3</p>
                        <h2>Calendário Semanal de Consultas</h2>
                    </div>
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
                </div>

                {(loadingConsultations || loadingSlots) && <LoadingState />}
                {!loadingConsultations && !loadingSlots && (
                    <WeekCalendar
                        weekDays={weekDays}
                        rows={calendarRows}
                        availabilityByDay={weekAvailabilityByDay}
                        consultationBlocks={weekConsultationBlocks}
                        blockedBlocks={weekBlockedSlots}
                        onOpenConsultation={(consultation) => {
                            setConsultationModal(consultation);
                            setCancelReason('');
                        }}
                        onOpenCellMenu={openCellActionMenu}
                        onOpenBlockedSlot={setUnblockSlotModal}
                    />
                )}
            </section>

            {cellActionMenu && (
                <CellActionMenuModal
                    date={cellActionMenu.date}
                    minutesFromMidnight={cellActionMenu.minutesFromMidnight}
                    loading={cellActionMenu.loading}
                    onSchedule={handleCellActionSchedule}
                    onBlock={handleCellActionBlock}
                    onClose={() => setCellActionMenu(null)}
                />
            )}

            {unblockSlotModal && (
                <UnblockSlotModal
                    slot={unblockSlotModal}
                    onClose={() => setUnblockSlotModal(null)}
                    onConfirm={handleUnblockSlot}
                />
            )}

            {availabilityModal && (
                <AvailabilityEditorModal
                    state={availabilityModal}
                    onClose={() => setAvailabilityModal(null)}
                    onChange={setAvailabilityModal}
                    onSubmit={handleAvailabilitySave}
                    saving={availabilitySaving}
                />
            )}

            {singleDayAvailabilityModal && (
                <SingleDayAvailabilityModal
                    state={singleDayAvailabilityModal}
                    onClose={() => setSingleDayAvailabilityModal(null)}
                    onChange={setSingleDayAvailabilityModal}
                    onSubmit={handleSingleDayAvailabilitySave}
                    saving={singleDayAvailabilitySaving}
                />
            )}

            {scheduleConsultationModal && (
                <ScheduleConsultationModal
                    state={scheduleConsultationModal}
                    onClose={() => setScheduleConsultationModal(null)}
                    onChange={setScheduleConsultationModal}
                    onSubmit={handleScheduleConsultation}
                    saving={scheduleConsultationSaving}
                />
            )}

            {consultationModal && (
                <ConsultationDetailsModal
                    consultation={consultationModal}
                    cancelReason={cancelReason}
                    onClose={() => {
                        setConsultationModal(null);
                        setCancelReason('');
                    }}
                    onCancelReasonChange={setCancelReason}
                    onConfirmCancel={handleCancelConsultation}
                    cancelSubmitting={cancelSubmitting}
                />
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

function WeekCalendar({ weekDays, rows, availabilityByDay, consultationBlocks, blockedBlocks, onOpenConsultation, onOpenCellMenu, onOpenBlockedSlot }) {
    return (
        <div className="week-calendar">
            <div className="week-calendar__header">
                <span className="week-calendar__time-label" />
                {weekDays.map((date) => {
                    const isToday = toIsoDate(date) === toIsoDate(new Date());
                    return (
                        <div className={isToday ? 'week-calendar__day week-calendar__day--today' : 'week-calendar__day'} key={toIsoDate(date)}>
                            <strong>{dayHeaderLabel(date)}</strong>
                            <span>{formatDate(date).slice(0, 5)}</span>
                        </div>
                    );
                })}
            </div>

            <div className="week-calendar__body">
                <div className="week-calendar__times">
                    {rows.map((row) => (
                        <div className="week-calendar__time-cell" key={row.minutes}>
                            {row.label}
                        </div>
                    ))}
                </div>

                {weekDays.map((date) => {
                    const dayKey = toIsoDate(date);
                    const now = new Date();
                    const nowDayKey = toIsoDate(now);
                    const nowMinutes = now.getHours() * 60 + now.getMinutes();
                    const dayAvailability = availabilityByDay.get(dayKey) || [];
                    const dayBlocks = consultationBlocks.filter((block) => block.dayKey === dayKey);
                    const dayBlockedSlots = (blockedBlocks || []).filter((slot) => slot.dayKey === dayKey);
                    return (
                        <div className="week-calendar__column" key={dayKey}>
                            {rows.map((row) => {
                                const available = isMinuteWithinAvailability(row.minutes, dayAvailability);
                                const consultation = findBlockAtMinute(dayBlocks, row.minutes);
                                const blocked = dayBlockedSlots.some((slot) => row.minutes >= slot.startMinutes && row.minutes < slot.startMinutes + slot.durationMinutes);
                                const isPast = dayKey < nowDayKey || (dayKey === nowDayKey && row.minutes < nowMinutes);
                                const disabled = !available || Boolean(consultation) || blocked || isPast;
                                return (
                                    <button
                                        key={row.minutes}
                                        type="button"
                                        className={available ? 'week-calendar__cell week-calendar__cell--available' : 'week-calendar__cell week-calendar__cell--blocked'}
                                        disabled={disabled}
                                        onClick={() => !disabled && onOpenCellMenu(date, row.minutes)}
                                        title={available ? 'Clique para agendar ou bloquear este horário' : 'Fora da disponibilidade'}
                                    />
                                );
                            })}

                            {dayBlocks.map((block) => (
                                <button
                                    type="button"
                                    key={block.id}
                                    className={`week-calendar__block ${weekCalendarBlockClass(block)}`}
                                    style={{
                                        top: `${((block.startMinutes - CALENDAR_START_HOUR * 60) / CALENDAR_SLOT_MINUTES) * 44}px`,
                                        height: `${Math.max(44, Math.ceil(block.durationMinutes / CALENDAR_SLOT_MINUTES) * 44)}px`,
                                    }}
                                    onClick={() => onOpenConsultation(block)}
                                    title={`${block.pacienteNome} - ${formatTime(block.inicioEm)} - ${formatTime(block.fimEm)}`}
                                >
                                    <span className="week-calendar__block-title">{block.pacienteNome}</span>
                                    <strong>{formatTime(block.inicioEm)} - {formatTime(block.fimEm)}</strong>
                                    <span className="status-badge status-badge--type">
                                        {block.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}
                                    </span>
                                </button>
                            ))}

                            {dayBlockedSlots.map((slot) => (
                                <button
                                    type="button"
                                    key={`blocked-${slot.id}`}
                                    className="week-calendar__block week-calendar__block--blocked-slot"
                                    style={{
                                        top: `${((slot.startMinutes - CALENDAR_START_HOUR * 60) / CALENDAR_SLOT_MINUTES) * 44}px`,
                                        height: `${Math.max(44, Math.ceil(slot.durationMinutes / CALENDAR_SLOT_MINUTES) * 44)}px`,
                                    }}
                                    onClick={() => onOpenBlockedSlot(slot)}
                                    title={`Horário bloqueado — ${formatTime(slot.inicioEm)} - ${formatTime(slot.fimEm)}`}
                                >
                                    <span className="week-calendar__block-title">Bloqueado</span>
                                    <strong>{formatTime(slot.inicioEm)} - {formatTime(slot.fimEm)}</strong>
                                </button>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function AvailabilityEditorModal({ state, onClose, onChange, onSubmit, saving }) {
    function toggleDay(day) {
        onChange((current) => ({
            ...current,
            selectedDays: current.selectedDays.includes(day)
                ? current.selectedDays.filter((item) => item !== day)
                : [...current.selectedDays, day],
        }));
    }

    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Editar disponibilidade" onClick={(event) => event.stopPropagation()}>
                <div className="modal-panel__header">
                    <div>
                        <p className="eyebrow">Minha Disponibilidade Semanal</p>
                        <h3>Editar disponibilidade</h3>
                    </div>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </div>

                <form className="stack-form" onSubmit={onSubmit}>
                    <fieldset className="checkbox-group">
                        <legend>Dias disponíveis</legend>
                        <div>
                            {DAY_OPTIONS.map((day) => (
                                <label className="check-card" key={day.value}>
                                    <input type="checkbox" checked={state.selectedDays.includes(day.value)} onChange={() => toggleDay(day.value)} />
                                    <span>{day.label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div className="form-grid">
                        <label>
                            Horário de início
                            <input type="time" value={state.horaInicio} onChange={(event) => onChange((current) => ({ ...current, horaInicio: event.target.value }))} required />
                        </label>
                        <label>
                            Horário de fim
                            <input type="time" value={state.horaFim} onChange={(event) => onChange((current) => ({ ...current, horaFim: event.target.value }))} required />
                        </label>
                    </div>

                    <label className="field">
                        Duração da consulta
                        <input
                            type="number"
                            min="10"
                            step="5"
                            value={state.duracaoSlotMinutos}
                            onChange={(event) => onChange((current) => ({ ...current, duracaoSlotMinutos: event.target.value }))}
                        />
                    </label>

                    <div className="inline-actions inline-actions--spread">
                        <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
                        <button className="primary-button primary-button--fit" type="submit" disabled={saving}>
                            {saving ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SingleDayAvailabilityModal({ state, onClose, onChange, onSubmit, saving }) {
    const dayLabel = state.dayKey ? DAY_FULL_LABELS[state.dayKey] : '';

    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div className="modal-panel" role="dialog" aria-modal="true" aria-label={`Editar disponibilidade de ${dayLabel}`} onClick={(event) => event.stopPropagation()}>
                <div className="modal-panel__header">
                    <div>
                        <p className="eyebrow">Editar disponibilidade</p>
                        <h3>{dayLabel}</h3>
                    </div>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </div>

                <form className="stack-form" onSubmit={onSubmit}>
                    <div className="form-grid">
                        <label>
                            Horário de início
                            <input type="time" value={state.horaInicio} onChange={(event) => onChange((current) => ({ ...current, horaInicio: event.target.value }))} required />
                        </label>
                        <label>
                            Horário de fim
                            <input type="time" value={state.horaFim} onChange={(event) => onChange((current) => ({ ...current, horaFim: event.target.value }))} required />
                        </label>
                    </div>

                    <label className="field">
                        Duração da consulta
                        <input
                            type="number"
                            min="10"
                            step="5"
                            value={state.duracaoSlotMinutos}
                            onChange={(event) => onChange((current) => ({ ...current, duracaoSlotMinutos: event.target.value }))}
                        />
                    </label>

                    <div className="inline-actions inline-actions--spread">
                        <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
                        <button className="primary-button primary-button--fit" type="submit" disabled={saving}>
                            {saving ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PatientSearchField({ value, selectedId, onSelect, onClear }) {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    const search = useCallback((term) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!term.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await schedulingApi.listMyPatients({ nome: term.trim() });
                setResults(data || []);
                setOpen(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, []);

    function handleChange(event) {
        const term = event.target.value;
        setQuery(term);
        if (selectedId) {
            onClear();
        }
        search(term);
    }

    function handleSelect(paciente) {
        setQuery(paciente.nome);
        setResults([]);
        setOpen(false);
        onSelect(paciente);
    }

    function handleBlur(event) {
        if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
            setOpen(false);
            if (!selectedId) {
                setQuery('');
            }
        }
    }

    return (
        <div className="field" ref={containerRef} onBlur={handleBlur} style={{ position: 'relative' }}>
            <label htmlFor="patient-search">Paciente</label>
            <input
                id="patient-search"
                type="text"
                value={query}
                onChange={handleChange}
                onFocus={() => query.trim() && !selectedId && search(query)}
                placeholder="Buscar paciente pelo nome..."
                autoComplete="off"
                required
            />
            {loading && <span style={{ position: 'absolute', right: '10px', top: '34px', fontSize: '12px', color: '#6B7280' }}>Buscando...</span>}
            {open && !loading && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                    zIndex: 100,
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    maxHeight: '200px',
                    overflowY: 'auto',
                }}>
                    {results.length === 0
                        ? <li style={{ padding: '10px 14px', color: '#6B7280', fontSize: '14px' }}>Nenhum paciente encontrado</li>
                        : results.map((paciente) => (
                            <li key={paciente.id}>
                                <button
                                    type="button"
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '10px 14px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                    }}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => handleSelect(paciente)}
                                >
                                    {paciente.nome}
                                </button>
                            </li>
                        ))
                    }
                </ul>
            )}
        </div>
    );
}

function ScheduleConsultationModal({ state, onClose, onChange, onSubmit, saving }) {
    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Agendar Consulta" onClick={(event) => event.stopPropagation()}>
                <div className="modal-panel__header">
                    <div>
                        <p className="eyebrow">Nova consulta</p>
                        <h3>Agendar Consulta</h3>
                    </div>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </div>

                <form className="stack-form" onSubmit={onSubmit}>
                    <PatientSearchField
                        value={state.pacienteNome}
                        selectedId={state.pacienteId}
                        onSelect={(paciente) => onChange((current) => ({ ...current, pacienteId: paciente.id, pacienteNome: paciente.nome }))}
                        onClear={() => onChange((current) => ({ ...current, pacienteId: null, pacienteNome: '' }))}
                    />

                    <div className="form-grid">
                        <label>
                            Data
                            <input type="text" value={formatDate(new Date(`${state.data}T${state.horaInicio}`))} readOnly />
                        </label>
                        <label>
                            Horário
                            <input type="text" value={`${state.horaInicio} - ${state.horaFim}`} readOnly />
                        </label>
                    </div>

                    <fieldset className="checkbox-group">
                        <legend>Tipo de atendimento</legend>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <label className="check-card">
                                <input type="radio" name="tipoAtendimento" value="ONLINE" checked={state.tipoAtendimento === 'ONLINE'} onChange={() => onChange((current) => ({ ...current, tipoAtendimento: 'ONLINE' }))} />
                                <span>Online</span>
                            </label>
                            <label className="check-card">
                                <input type="radio" name="tipoAtendimento" value="PRESENCIAL" checked={state.tipoAtendimento === 'PRESENCIAL'} onChange={() => onChange((current) => ({ ...current, tipoAtendimento: 'PRESENCIAL' }))} />
                                <span>Presencial</span>
                            </label>
                        </div>
                    </fieldset>

                    <label className="field">
                        Observações (máximo 300 caracteres)
                        <textarea
                            value={state.observacoes}
                            onChange={(event) => onChange((current) => ({ ...current, observacoes: event.target.value.slice(0, 300) }))}
                            rows="4"
                            placeholder="Adicione observações sobre a consulta"
                        />
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>{state.observacoes.length}/300</span>
                    </label>

                    <div className="inline-actions inline-actions--spread">
                        <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
                        <button className="primary-button primary-button--fit" type="submit" disabled={saving || !state.pacienteId}>
                            {saving ? <Loader2 className="spin" size={17} /> : <CalendarPlus size={17} />}
                            Agendar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ConsultationDetailsModal({ consultation, cancelReason, onClose, onCancelReasonChange, onConfirmCancel, cancelSubmitting }) {
    const canCancel = canCancelConsultation(consultation);

    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Detalhes da consulta" onClick={(event) => event.stopPropagation()}>
                <div className="modal-panel__header">
                    <div>
                        <p className="eyebrow">Consulta</p>
                        <h3>{consultation.pacienteNome}</h3>
                    </div>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </div>

                <dl className="details-list">
                    <div>
                        <dt>Data e horário</dt>
                        <dd>{formatDate(consultation.inicioEm)} · {formatTime(consultation.inicioEm)} - {formatTime(consultation.fimEm)}</dd>
                    </div>
                    <div>
                        <dt>Tipo</dt>
                        <dd>{consultation.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}</dd>
                    </div>
                    <div>
                        <dt>Status</dt>
                        <dd>{consultationStatusLabel(consultation.status)}</dd>
                    </div>
                    <div>
                        <dt>Observações</dt>
                        <dd>{consultation.observacoes || 'Sem observações.'}</dd>
                    </div>
                </dl>

                {canCancel && (
                    <div className="details-cancel">
                        <label>
                            Motivo do cancelamento
                            <textarea value={cancelReason} onChange={(event) => onCancelReasonChange(event.target.value)} rows="4" placeholder="Informe o motivo do cancelamento" />
                        </label>
                        <div className="inline-actions inline-actions--spread">
                            <button className="ghost-button" type="button" onClick={onClose}>Fechar</button>
                            <button className="danger-button" type="button" onClick={onConfirmCancel} disabled={cancelSubmitting}>
                                {cancelSubmitting ? <Loader2 className="spin" size={17} /> : <Trash2 size={17} />}
                                Cancelar consulta
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CellActionMenuModal({ date, minutesFromMidnight, loading, onSchedule, onBlock, onClose }) {
    const timeLabel = minutesToTimeLabel(minutesFromMidnight);
    const endLabel = minutesToTimeLabel(minutesFromMidnight + DEFAULT_DURATION);
    const dateLabel = date ? formatDate(date) : '';

    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div className="modal-panel modal-panel--compact" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <div className="modal-panel__header">
                    <div>
                        <p className="eyebrow">Horário disponível</p>
                        <h3>{dateLabel} · {timeLabel} – {endLabel}</h3>
                    </div>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </div>
                <div className="stack-form">
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>O que deseja fazer com este horário?</p>
                    <button className="primary-button" type="button" onClick={onSchedule} disabled={loading === 'schedule'}>
                        {loading === 'schedule' ? <Loader2 className="spin" size={17} /> : <CalendarPlus size={17} />}
                        Agendar consulta com paciente
                    </button>
                    <button className="secondary-button secondary-button--outline" type="button" onClick={onBlock} disabled={loading === 'block'}>
                        {loading === 'block' ? <Loader2 className="spin" size={17} /> : <X size={17} />}
                        Marcar como indisponível
                    </button>
                </div>
            </div>
        </div>
    );
}

function UnblockSlotModal({ slot, onClose, onConfirm }) {
    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div className="modal-panel modal-panel--compact" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <div className="modal-panel__header">
                    <div>
                        <p className="eyebrow">Horário bloqueado</p>
                        <h3>Remover bloqueio?</h3>
                    </div>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </div>
                <div className="stack-form">
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>
                        {slot ? `${formatDate(slot.inicioEm)} · ${formatTime(slot.inicioEm)} – ${formatTime(slot.fimEm)}` : ''}
                    </p>
                    <p>Este horário ficará disponível para agendamento novamente.</p>
                    <div className="inline-actions inline-actions--spread">
                        <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
                        <button className="primary-button primary-button--fit" type="button" onClick={onConfirm}>Remover bloqueio</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function latestRulesByDay(rules) {
    const map = new Map();

    rules.forEach((rule) => {
        const current = map.get(rule.diaSemana);
        if (!current || rule.id > current.id) {
            map.set(rule.diaSemana, rule);
        }
    });

    return map;
}

function buildAvailabilitySummary(map) {
    return DAY_ORDER.map((day) => {
        const rule = map.get(day);
        return rule ? { ...rule, diaSemana: day } : { diaSemana: day, ativo: false };
    });
}

function buildWeekDays(startDate) {
    return Array.from({ length: 7 }, (_, index) => addDays(startDate, index));
}

function buildCalendarRows(startHour, endHour, minutesStep) {
    const rows = [];
    for (let minutes = startHour * 60; minutes < endHour * 60; minutes += minutesStep) {
        rows.push({ minutes, label: minutesToTimeLabel(minutes) });
    }
    return rows;
}

function buildWeekAvailability(weekDays, rulesMap) {
    const map = new Map();
    weekDays.forEach((date) => {
        const dayKey = toIsoDate(date);
        const dayRule = rulesMap.get(dayValueFromDate(date));
        const ranges = dayRule && dayRule.ativo
            ? [{ start: timeStringToMinutes(dayRule.horaInicio), end: timeStringToMinutes(dayRule.horaFim) }]
            : [];
        map.set(dayKey, ranges);
    });
    return map;
}

function buildWeekBlocks(weekDays, consultations) {
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

function isMinuteWithinAvailability(minutes, availabilityRanges) {
    return availabilityRanges.some((range) => minutes >= range.start && minutes < range.end);
}

function findBlockAtMinute(dayBlocks, minutes) {
    return dayBlocks.find((block) => minutes >= block.startMinutes && minutes < block.startMinutes + block.durationMinutes);
}

function weekCalendarBlockClass(block) {
    if (block.status === 'EM_ANDAMENTO') return 'week-calendar__block--in-progress';
    if (block.status === 'CONCLUIDA') return 'week-calendar__block--completed';
    if (block.status === 'CANCELADA') return 'week-calendar__block--cancelled';
    return 'week-calendar__block--scheduled';
}

function consultationStatusLabel(status) {
    return {
        AGENDADA: 'Agendada',
        CONFIRMADA: 'Confirmada',
        EM_ANDAMENTO: 'Em andamento',
        CONCLUIDA: 'Concluída',
        CANCELADA: 'Cancelada',
        FALTOU: 'Faltou',
    }[status] || status;
}

function statusBadgeClass(status) {
    if (status === 'AGENDADA' || status === 'CONFIRMADA') return 'status-badge--agendada';
    if (status === 'EM_ANDAMENTO') return 'status-badge--em_andamento';
    if (status === 'CONCLUIDA') return 'status-badge--concluida';
    return 'status-badge--cancelada';
}

function canCancelConsultation(consultation) {
    return consultation.status === 'AGENDADA' && new Date(consultation.inicioEm).getTime() > Date.now();
}

function defaultAvailabilityModal(dayKey, rule) {
    return {
        selectedDays: [dayKey],
        horaInicio: rule?.horaInicio ? normalizeClock(rule.horaInicio) : '08:00',
        horaFim: rule?.horaFim ? normalizeClock(rule.horaFim) : '12:00',
        duracaoSlotMinutos: rule?.duracaoSlotMinutos || DEFAULT_DURATION,
    };
}

function defaultWeeklyAvailabilityModal(availabilitySummary) {
    const selectedDays = availabilitySummary
        .filter((item) => item.ativo)
        .map((item) => item.diaSemana);
    const firstActiveRule = availabilitySummary.find((item) => item.ativo);

    return {
        selectedDays,
        horaInicio: firstActiveRule?.horaInicio ? normalizeClock(firstActiveRule.horaInicio) : '08:00',
        horaFim: firstActiveRule?.horaFim ? normalizeClock(firstActiveRule.horaFim) : '12:00',
        duracaoSlotMinutos: firstActiveRule?.duracaoSlotMinutos || DEFAULT_DURATION,
    };
}

function defaultSingleDayAvailabilityModal(dayKey, rule) {
    return {
        dayKey,
        horaInicio: rule?.horaInicio ? normalizeClock(rule.horaInicio) : '08:00',
        horaFim: rule?.horaFim ? normalizeClock(rule.horaFim) : '12:00',
        duracaoSlotMinutos: rule?.duracaoSlotMinutos || DEFAULT_DURATION,
    };
}

function normalizeText(value = '') {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function dayValueFromDate(date) {
    return DAY_ORDER[(date.getDay() + 6) % 7];
}

function dayHeaderLabel(date) {
    return `${DAY_LABELS[dayValueFromDate(date)]} ${formatDate(date).slice(0, 5)}`;
}

function timeStringToMinutes(value) {
    if (!value) return 0;
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTimeLabel(minutes) {
    const safeMinutes = Math.max(0, minutes);
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function normalizeClock(value) {
    if (!value) return '00:00';
    if (typeof value === 'string') {
        return value.slice(0, 5);
    }
    return formatTime(value);
}

function formatClock(value) {
    return normalizeClock(value);
}

function startOfWeek(date) {
    const value = new Date(date);
    const day = value.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    value.setDate(value.getDate() + diff);
    value.setHours(0, 0, 0, 0);
    return value;
}
