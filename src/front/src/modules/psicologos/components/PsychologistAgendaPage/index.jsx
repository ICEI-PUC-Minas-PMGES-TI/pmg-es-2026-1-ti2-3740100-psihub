import { ChevronLeft, ChevronRight, Download, Edit3, Search, SlidersHorizontal } from 'lucide-react';
import { addDays, formatDate, formatTime } from '@/shared/utils/date.utils';
import {
    DAY_FULL_LABELS,
    DAY_ORDER,
    DEFAULT_DURATION,
    STATUS_OPTIONS,
    STATUS_OPTIONS_ACTIVE,
    TYPE_OPTIONS,
} from '@/modules/psicologos/utils/agenda.constants';
import {
    canCancelConsultation,
    consultationStatusLabel,
    defaultSingleDayAvailabilityModal,
    defaultWeeklyAvailabilityModal,
    formatClock,
    startOfWeek,
    statusBadgeClass,
} from '@/modules/psicologos/utils/agenda.utils';
import { useAgenda } from '@/modules/psicologos/hooks/useAgenda';
import {
    AvailabilityEditorModal,
    AvailabilitySkeletonGrid,
    CellActionMenuModal,
    ConsultationDetailsModal,
    LoadingState,
    ScheduleConsultationModal,
    SingleDayAvailabilityModal,
    UnblockSlotModal,
    WeekCalendar,
} from '../AgendaCalendario';

export function PsychologistAgendaPage({ onToast }) {
    const {
        loadingAvailability,
        loadingSlots,
        loadingConsultations,
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
        cancelSubmitting,
        availabilitySaving,
        singleDayAvailabilitySaving,
        scheduleConsultationSaving,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        searchQuery,
        setSearchQuery,
        dateFilter,
        setDateFilter,
        consultationPage,
        setConsultationPage,
        showHistory,
        setShowHistory,
        showMoreFilters,
        setShowMoreFilters,
        availabilitySummary,
        weekDays,
        calendarRows,
        isPastWeek,
        disablePreviousWeek,
        filteredConsultations,
        rowsWithSeparators,
        consultationPages,
        weekAvailabilityByDay,
        weekDurationByDay,
        weekBreakBlocks,
        weekConsultationBlocks,
        weekBlockedSlots,
        handleAvailabilitySave,
        handleSingleDayAvailabilitySave,
        handleScheduleConsultation,
        handleCancelConsultation,
        openCellActionMenu,
        handleCellActionSchedule,
        handleCellActionBlock,
        handleUnblockSlot,
        exportFilteredConsultations,
        handleUpdateStatus,
        statusSubmitting,
        handleEditConsultation,
        editSubmitting,
        handleDeleteConsultation,
        deleteSubmitting,
    } = useAgenda({ onToast });

    const todaySummary = (() => {
        const todayKey = new Date().toISOString().slice(0, 10);
        const todayConsultations = filteredConsultations.filter((item) => item.inicioEm?.slice(0, 10) === todayKey);
        const todayPending = todayConsultations.filter((item) => item.status === 'AGENDADA' || item.status === 'CONFIRMADA').length;
        const nextConsultation = filteredConsultations
            .filter((item) => new Date(item.inicioEm).getTime() > Date.now())
            .sort((a, b) => new Date(a.inicioEm) - new Date(b.inicioEm))[0] || null;
        return {
            total: todayConsultations.length,
            pending: todayPending,
            next: nextConsultation,
        };
    })();
    return (
        <div className="agenda-page">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">Agenda</p>
                    <h1>Agenda</h1>
                    <p className="agenda-page__subtitle">Gerencie sua disponibilidade e consultas agendadas.</p>
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

                {loadingAvailability ? (
                    <AvailabilitySkeletonGrid />
                ) : (
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
                                    {rule?.ativo && (
                                        <div className="availability-card__meta">Duração da consulta: {rule.duracaoSlotMinutos || DEFAULT_DURATION} min</div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="panel agenda-section">
                <div className="panel__header">
                    <div>
                        <p className="eyebrow">Seção 2</p>
                        <h2>Lista de Consultas Agendadas</h2>
                    </div>
                    <div className="agenda-table__summary">
                        <span>{filteredConsultations.length} consulta(s) encontrada(s)</span>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() => {
                                setShowHistory((h) => !h);
                                setStatusFilter('ALL');
                            }}
                        >
                            {showHistory ? 'Ocultar histórico' : 'Ver histórico de consultas'}
                        </button>
                    </div>
                </div>

                <div className="agenda-table-filters">
                    <div className="agenda-filter-group">
                        {(showHistory ? STATUS_OPTIONS : STATUS_OPTIONS_ACTIVE).map((option) => (
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
                    <div className="agenda-search-row">
                        <label className="agenda-search">
                            <Search size={16} />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Buscar paciente"
                            />
                        </label>
                        <label className="agenda-date-filter">
                            <span>Data</span>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(event) => setDateFilter(event.target.value)}
                                aria-label="Filtrar consultas por data"
                            />
                        </label>
                        <button
                            className={showMoreFilters ? 'ghost-button agenda-more-filters__trigger agenda-more-filters__trigger--open' : 'ghost-button agenda-more-filters__trigger'}
                            type="button"
                            onClick={() => setShowMoreFilters((current) => !current)}
                            aria-expanded={showMoreFilters}
                        >
                            <SlidersHorizontal size={16} />
                            Mais filtros
                        </button>
                    </div>
                    {showMoreFilters && (
                        <div className="agenda-more-filters" role="group" aria-label="Filtros adicionais">
                            <span>Tipo de atendimento</span>
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
                        </div>
                    )}
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
                            {rowsWithSeparators.map((item) => {
                                if (item.type === 'separator') {
                                    return (
                                        <div key="today-separator" className="agenda-table__today-separator">
                                            <span>{item.label}</span>
                                        </div>
                                    );
                                }
                                const consultation = item.data;
                                return (
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
                                );
                            })}
                        </div>

                        <div className="agenda-pagination">
                            <button className="ghost-button" type="button" onClick={() => setConsultationPage((current) => Math.max(1, current - 1))} disabled={consultationPage === 1}>
                                Anterior
                            </button>
                            <span>Página {consultationPage} de {consultationPages}</span>
                            <button className="ghost-button" type="button" onClick={() => setConsultationPage((current) => Math.min(consultationPages, current + 1))} disabled={consultationPage >= consultationPages}>
                                Próxima
                            </button>
                            <button className="secondary-button secondary-button--outline" type="button" onClick={exportFilteredConsultations}>
                                <Download size={17} />
                                Exportar lista filtrada ({filteredConsultations.length} consultas)
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
                    <div className="agenda-summary-bar" aria-label="Resumo do dia">
                        <article className="agenda-summary-chip">
                            <small>Total hoje</small>
                            <strong>{todaySummary.total}</strong>
                        </article>
                        <article className="agenda-summary-chip">
                            <small>Pendentes</small>
                            <strong>{todaySummary.pending}</strong>
                        </article>
                        <article className="agenda-summary-chip agenda-summary-chip--wide">
                            <small>Próxima</small>
                            <strong>{todaySummary.next
                                ? `${formatDate(todaySummary.next.inicioEm)} ${formatTime(todaySummary.next.inicioEm)}`
                                : 'Nenhuma consulta futura'}</strong>
                        </article>
                    </div>
                    <div className="week-nav">
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() => setWeekStart((current) => addDays(current, -7))}
                            disabled={disablePreviousWeek}
                        >
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
                    <div className="week-calendar-shell" key={weekDays[0] ? weekDays[0].toISOString().slice(0, 10) : 'calendar'}>
                        <WeekCalendar
                            weekDays={weekDays}
                            rows={calendarRows}
                            availabilityByDay={weekAvailabilityByDay}
                            durationByDay={weekDurationByDay}
                            consultationBlocks={weekConsultationBlocks}
                            blockedBlocks={weekBlockedSlots}
                            breakBlocks={weekBreakBlocks}
                            readOnly={isPastWeek}
                            onOpenConsultation={(consultation) => {
                                setConsultationModal(consultation);
                                setCancelReason('');
                            }}
                            onOpenCellMenu={openCellActionMenu}
                            onOpenBlockedSlot={setUnblockSlotModal}
                            onMoveConsultation={(payload, date, minutesFromMidnight) => {
                                const start = String(Math.floor(minutesFromMidnight / 60)).padStart(2, '0');
                                const mins = String(minutesFromMidnight % 60).padStart(2, '0');
                                const targetStart = `${date.toISOString().slice(0, 10)}T${start}:${mins}:00`;
                                const targetEndDate = new Date(new Date(targetStart).getTime() + (payload.durationMinutes || 50) * 60000);
                                const targetEnd = targetEndDate.toISOString().slice(0, 19);
                                handleEditConsultation({
                                    inicioEm: targetStart,
                                    fimEm: targetEnd,
                                    observacoes: null,
                                }, payload.id);
                            }}
                        />
                    </div>
                )}
            </section>

            {cellActionMenu && (
                <CellActionMenuModal
                    date={cellActionMenu.date}
                    minutesFromMidnight={cellActionMenu.minutesFromMidnight}
                    duration={cellActionMenu.duration || DEFAULT_DURATION}
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
                    activeDayKeys={availabilitySummary.filter((item) => item.ativo).map((item) => item.diaSemana)}
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
                    onCancelReasonChange={(value) => setCancelReason(value.slice(0, 300))}
                    onConfirmCancel={handleCancelConsultation}
                    cancelSubmitting={cancelSubmitting}
                    onUpdateStatus={handleUpdateStatus}
                    statusSubmitting={statusSubmitting}
                    onEditConsultation={handleEditConsultation}
                    editSubmitting={editSubmitting}
                    onDeleteConsultation={handleDeleteConsultation}
                    deleteSubmitting={deleteSubmitting}
                />
            )}
        </div>
    );
}

