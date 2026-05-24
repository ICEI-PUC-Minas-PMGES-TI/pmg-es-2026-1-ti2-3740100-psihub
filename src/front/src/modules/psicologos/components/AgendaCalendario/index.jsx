import { useMemo, useState } from 'react';
import { CalendarPlus, Loader2, Save, Trash2, X } from 'lucide-react';
import { formatDate, formatTime, toIsoDate } from '@/shared/utils/date.utils';
import { CALENDAR_SLOT_MINUTES, CALENDAR_START_HOUR, DAY_FULL_LABELS, DAY_OPTIONS, DAY_ORDER, DEFAULT_DURATION } from '@/modules/psicologos/hooks/agenda/agenda.constants';
import { canCancelConsultation, consultationStatusLabel, dayHeaderLabel, findBlockAtMinute, intervalsOverlap, isSlotWithinAvailability, minutesToTimeLabel, statusBadgeClass, weekCalendarBlockClass } from '@/modules/psicologos/hooks/agenda/agenda.utils';
import { usePatientSearchField } from '@/modules/psicologos/hooks/agenda/usePatientSearchField';

export function LoadingState() {
    return (
        <div className="loading-rows">
            <span />
            <span />
            <span />
        </div>
    );
}

export function AvailabilitySkeletonGrid() {
    return (
        <div className="availability-grid" aria-label="Carregando disponibilidade semanal">
            {DAY_ORDER.map((dayKey) => (
                <article className="availability-card availability-card--skeleton" key={dayKey}>
                    <span />
                    <span />
                    <span />
                </article>
            ))}
        </div>
    );
}

export function WeekCalendar({ weekDays, rows, availabilityByDay, durationByDay, consultationBlocks, blockedBlocks, breakBlocks, readOnly, onOpenConsultation, onOpenCellMenu, onOpenBlockedSlot, onMoveConsultation }) {
    return (
        <>
            <div className="week-calendar__legend" aria-label="Legenda do calendário semanal">
                <span><i className="week-calendar__legend-dot week-calendar__legend-dot--available" />Disponível</span>
                <span><i className="week-calendar__legend-dot week-calendar__legend-dot--scheduled" />Agendada</span>
                <span><i className="week-calendar__legend-dot week-calendar__legend-dot--confirmed" />Confirmada</span>
                <span><i className="week-calendar__legend-dot week-calendar__legend-dot--blocked" />Bloqueado</span>
                <span><i className="week-calendar__legend-dot week-calendar__legend-dot--completed" />Concluída</span>
                <span><i className="week-calendar__legend-dot week-calendar__legend-dot--cancelled" />Cancelada</span>
                <span><i className="week-calendar__legend-dot week-calendar__legend-dot--missed" />Falta</span>
            </div>
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
                        const isTodayColumn = dayKey === nowDayKey;
                    const dayAvailability = availabilityByDay.get(dayKey) || [];
                    const slotDuration = durationByDay.get(dayKey) || DEFAULT_DURATION;
                    const dayBlocks = consultationBlocks.filter((block) => block.dayKey === dayKey);
                    const dayBlockedSlots = (blockedBlocks || []).filter((slot) => slot.dayKey === dayKey);
                    const dayBreakBlocks = (breakBlocks || []).filter((block) => block.dayKey === dayKey);
                    return (
                        <div className="week-calendar__column" key={dayKey}>
                            {rows.map((row) => {
                                const breakBlocked = dayBreakBlocks.some((block) => intervalsOverlap(row.minutes, row.minutes + CALENDAR_SLOT_MINUTES, block.startMinutes, block.startMinutes + block.durationMinutes));
                                const available = isSlotWithinAvailability(row.minutes, slotDuration, dayAvailability);
                                const consultation = findBlockAtMinute(dayBlocks, row.minutes);
                                const blocked = dayBlockedSlots.some((slot) => row.minutes >= slot.startMinutes && row.minutes < slot.startMinutes + slot.durationMinutes);
                                const isPast = dayKey < nowDayKey || (dayKey === nowDayKey && row.minutes < nowMinutes);
                                const disabled = readOnly || !available || Boolean(consultation) || blocked || breakBlocked || isPast;
                                const isCurrentSlot = isTodayColumn && row.minutes <= nowMinutes && nowMinutes < row.minutes + CALENDAR_SLOT_MINUTES;
                                return (
                                    <button
                                        key={row.minutes}
                                        type="button"
                                        className={available && !breakBlocked
                                            ? `week-calendar__cell week-calendar__cell--available${isCurrentSlot ? ' week-calendar__cell--now' : ''}`
                                            : `week-calendar__cell week-calendar__cell--blocked${isCurrentSlot ? ' week-calendar__cell--now' : ''}`}
                                        disabled={disabled}
                                        onClick={() => !disabled && onOpenCellMenu(date, row.minutes)}
                                        onDragOver={(event) => {
                                            if (!disabled && onMoveConsultation) {
                                                event.preventDefault();
                                            }
                                        }}
                                        onDrop={(event) => {
                                            if (disabled || !onMoveConsultation) return;
                                            const payload = event.dataTransfer.getData('application/psihub-consultation');
                                            if (!payload) return;
                                            try {
                                                const parsed = JSON.parse(payload);
                                                onMoveConsultation(parsed, date, row.minutes);
                                            } catch {
                                                // no-op
                                            }
                                        }}
                                        data-hint={available && !disabled ? 'Clique para agendar' : null}
                                        title={available ? 'Clique para agendar ou bloquear este horário' : 'Fora da disponibilidade'}
                                    />
                                    );
                                })}

                            {isTodayColumn && (
                                <div
                                    className="week-calendar__now-line"
                                    aria-hidden="true"
                                    style={{
                                        top: `${((nowMinutes - CALENDAR_START_HOUR * 60) / CALENDAR_SLOT_MINUTES) * 44}px`,
                                    }}
                                />
                            )}

                                {dayBlocks.map((block) => (
                                    <button
                                        type="button"
                                        key={block.id}
                                        className={`week-calendar__block ${weekCalendarBlockClass(block)}${!readOnly ? ' week-calendar__block--draggable' : ''}`}
                                        draggable={!readOnly}
                                        style={{
                                            top: `${((block.startMinutes - CALENDAR_START_HOUR * 60) / CALENDAR_SLOT_MINUTES) * 44}px`,
                                            height: `${Math.max(44, Math.ceil(block.durationMinutes / CALENDAR_SLOT_MINUTES) * 44)}px`,
                                        }}
                                        onDragStart={(event) => {
                                            event.dataTransfer.setData('application/psihub-consultation', JSON.stringify({
                                                id: block.id,
                                                durationMinutes: block.durationMinutes,
                                            }));
                                        }}
                                        onClick={() => onOpenConsultation(block)}
                                        data-tooltip={`${block.pacienteNome}\n${consultationStatusLabel(block.status)} · ${block.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}\n${formatTime(block.inicioEm)} - ${formatTime(block.fimEm)}`}
                                        title={`${block.pacienteNome} - ${formatTime(block.inicioEm)} - ${formatTime(block.fimEm)}`}
                                    >
                                        <span className="week-calendar__block-title">{block.pacienteNome}</span>
                                        <strong>{formatTime(block.inicioEm)} - {formatTime(block.fimEm)}</strong>
                                        <span className={`status-badge ${statusBadgeClass(block.status)}`}>
                                            {consultationStatusLabel(block.status)}
                                        </span>
                                        <span className="status-badge status-badge--type">
                                            {block.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}
                                        </span>
                                </button>
                            ))}

                            {dayBreakBlocks.map((block) => (
                                <div
                                    key={`break-${block.dayKey}`}
                                    className="week-calendar__block week-calendar__block--meal-break"
                                    style={{
                                        top: `${((block.startMinutes - CALENDAR_START_HOUR * 60) / CALENDAR_SLOT_MINUTES) * 44}px`,
                                        height: `${Math.max(44, Math.ceil(block.durationMinutes / CALENDAR_SLOT_MINUTES) * 44)}px`,
                                    }}
                                    title="Horário reservado para intervalo"
                                >
                                    <span className="week-calendar__block-title">🍽️ Intervalo / Refeição</span>
                                    <strong>{block.startLabel} – {block.endLabel}</strong>
                                </div>
                            ))}

                            {dayBlockedSlots.map((slot) => (
                                    <button
                                        type="button"
                                        key={`blocked-${slot.id}`}
                                        className="week-calendar__block week-calendar__block--blocked-slot"
                                        disabled={readOnly}
                                        style={{
                                            top: `${((slot.startMinutes - CALENDAR_START_HOUR * 60) / CALENDAR_SLOT_MINUTES) * 44}px`,
                                            height: `${Math.max(44, Math.ceil(slot.durationMinutes / CALENDAR_SLOT_MINUTES) * 44)}px`,
                                        }}
                                        onClick={() => !readOnly && onOpenBlockedSlot(slot)}
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
        </>
    );
}

export function AvailabilityEditorModal({ state, activeDayKeys, onClose, onChange, onSubmit, saving }) {
    const affectedDays = state.selectedDays.filter((day) => activeDayKeys.includes(day));

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

                    <AvailabilityBreakFields
                        state={state}
                        onChange={onChange}
                        note="O intervalo será aplicado a todos os dias selecionados."
                    />

                    {affectedDays.length > 0 && (
                        <div className="availability-warning" role="alert">
                            <strong>Atenção:</strong>
                            <span>esta ação substituirá a disponibilidade de</span>
                            <span className="availability-warning__days">
                                {affectedDays.map((day) => (
                                    <mark key={day}>{DAY_FULL_LABELS[day]}</mark>
                                ))}
                            </span>
                        </div>
                    )}

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

export function SingleDayAvailabilityModal({ state, onClose, onChange, onSubmit, saving }) {
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

                    <AvailabilityBreakFields state={state} onChange={onChange} />

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

function AvailabilityBreakFields({ state, onChange, note }) {
    function toggleBreak(enabled) {
        onChange((current) => ({
            ...current,
            configurarPausa: enabled,
            pausaInicio: current.pausaInicio || '12:00',
            pausaFim: current.pausaFim || '13:00',
        }));
    }

    return (
        <fieldset className="availability-break">
            <legend>Intervalo / Horário de almoço</legend>
            <label className="check-card availability-break__toggle">
                <input
                    type="checkbox"
                    checked={Boolean(state.configurarPausa)}
                    onChange={(event) => toggleBreak(event.target.checked)}
                />
                <span>Configurar intervalo</span>
            </label>

            {state.configurarPausa && (
                <>
                    <div className="form-grid">
                        <label>
                            Início do intervalo
                            <input
                                type="time"
                                value={state.pausaInicio}
                                onChange={(event) => onChange((current) => ({ ...current, pausaInicio: event.target.value }))}
                                required
                            />
                        </label>
                        <label>
                            Fim do intervalo
                            <input
                                type="time"
                                value={state.pausaFim}
                                onChange={(event) => onChange((current) => ({ ...current, pausaFim: event.target.value }))}
                                required
                            />
                        </label>
                    </div>
                    {note && <p>{note}</p>}
                </>
            )}
        </fieldset>
    );
}

function PatientSearchField({ value, selectedId, onSelect, onClear }) {
    const {
        query,
        results,
        loading,
        open,
        containerRef,
        search,
        handleChange,
        handleSelect,
        handleBlur,
    } = usePatientSearchField({ value, selectedId, onSelect, onClear });
    return (
        <div className="field patient-search-field" ref={containerRef} onBlur={handleBlur}>
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
            {loading && <span className="patient-search-field__hint">Buscando...</span>}
            {open && !loading && (
                <ul className="patient-search-field__results">
                    {results.length === 0
                        ? <li className="patient-search-field__empty">Nenhum paciente encontrado</li>
                        : results.map((paciente) => (
                            <li key={paciente.id}>
                                <button
                                    type="button"
                                    className="patient-search-field__option"
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

export function ScheduleConsultationModal({ state, onClose, onChange, onSubmit, saving }) {
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
                        <div className="consultation-radio-grid consultation-radio-grid--two-columns">
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

                    <fieldset className="checkbox-group">
                        <legend>Recorrência</legend>
                        <div className="consultation-radio-grid consultation-radio-grid--four-columns">
                            {['NENHUMA', 'SEMANAL', 'QUINZENAL', 'MENSAL'].map((value) => (
                                <label className="check-card" key={value}>
                                    <input
                                        type="radio"
                                        name="recorrencia"
                                        value={value}
                                        checked={state.recorrencia === value}
                                        onChange={() => onChange((current) => ({ ...current, recorrencia: value }))}
                                    />
                                    <span>{value.toLowerCase()}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {state.recorrencia !== 'NENHUMA' && (
                        <label className="field">
                            Ocorrências
                            <input
                                type="number"
                                min="2"
                                max="48"
                                value={state.ocorrencias}
                                onChange={(event) => onChange((current) => ({ ...current, ocorrencias: event.target.value }))}
                            />
                        </label>
                    )}

                    <label className="field">
                        Observações (máximo 300 caracteres)
                        <textarea
                            value={state.observacoes}
                            onChange={(event) => onChange((current) => ({ ...current, observacoes: event.target.value.slice(0, 300) }))}
                            rows="4"
                            placeholder="Adicione observações sobre a consulta"
                        />
                        <span className="textarea-counter">{state.observacoes.length}/300</span>
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

export function ConsultationDetailsModal({ consultation, cancelReason, onClose, onCancelReasonChange, onConfirmCancel, cancelSubmitting, onUpdateStatus, statusSubmitting, onEditConsultation, editSubmitting, onDeleteConsultation, deleteSubmitting }) {
    const canCancel = canCancelConsultation(consultation);
    const cancelLimitReached = cancelReason.length >= 300;
    const hasPatientContact = Boolean(consultation.pacienteTelefone || consultation.pacienteEmail);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({
        inicioEm: consultation.inicioEm,
        fimEm: consultation.fimEm,
        tipoAtendimento: consultation.tipoAtendimento,
        observacoes: consultation.observacoes || '',
    });

    const statusActions = useMemo(() => [
        { value: 'CONFIRMADA', label: 'Confirmar' },
        { value: 'EM_ANDAMENTO', label: 'Iniciar' },
        { value: 'CONCLUIDA', label: 'Concluir' },
        { value: 'FALTOU', label: 'Marcar falta' },
    ], []);

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
                    {hasPatientContact && (
                        <div>
                            <dt>Contato do paciente</dt>
                            <dd className="details-contact">
                                {consultation.pacienteTelefone && <span>Telefone: {consultation.pacienteTelefone}</span>}
                                {consultation.pacienteEmail && <span>E-mail: {consultation.pacienteEmail}</span>}
                            </dd>
                        </div>
                    )}
                    <div>
                        <dt>Observações</dt>
                        <dd>{consultation.observacoes || 'Sem observações.'}</dd>
                    </div>
                </dl>

                <div className="inline-actions agenda-modal__status-actions">
                    {statusActions.map((action) => (
                        <button
                            key={action.value}
                            className="ghost-button"
                            type="button"
                            disabled={statusSubmitting}
                            onClick={() => onUpdateStatus?.(action.value)}
                        >
                            {action.label}
                        </button>
                    ))}
                    <button className="ghost-button" type="button" onClick={() => setEditMode((v) => !v)}>
                        {editMode ? 'Fechar edição' : 'Editar consulta'}
                    </button>
                    <button className="danger-button" type="button" disabled={deleteSubmitting} onClick={() => onDeleteConsultation?.()}>
                        {deleteSubmitting ? <Loader2 className="spin" size={17} /> : <Trash2 size={17} />}
                        Excluir
                    </button>
                </div>

                {editMode && (
                    <form
                        className="stack-form agenda-modal__edit-form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            onEditConsultation?.(editForm);
                        }}
                    >
                        <label>
                            Início
                            <input
                                type="datetime-local"
                                value={editForm.inicioEm?.slice(0, 16)}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, inicioEm: `${event.target.value}:00` }))}
                                required
                            />
                        </label>
                        <label>
                            Fim
                            <input
                                type="datetime-local"
                                value={editForm.fimEm?.slice(0, 16)}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, fimEm: `${event.target.value}:00` }))}
                            />
                        </label>
                        <label>
                            Tipo
                            <select
                                value={editForm.tipoAtendimento}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, tipoAtendimento: event.target.value }))}
                            >
                                <option value="ONLINE">Online</option>
                                <option value="PRESENCIAL">Presencial</option>
                            </select>
                        </label>
                        <label>
                            Observações
                            <textarea
                                value={editForm.observacoes}
                                maxLength={300}
                                rows={3}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, observacoes: event.target.value }))}
                            />
                        </label>
                        <button className="primary-button primary-button--fit" type="submit" disabled={editSubmitting}>
                            {editSubmitting ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
                            Salvar alterações
                        </button>
                    </form>
                )}

                {canCancel && (
                    <div className="details-cancel">
                        <p className="details-cancel__notice">O horário será liberado automaticamente e ficará disponível para novos agendamentos.</p>
                        <label>
                            Motivo do cancelamento
                            <textarea
                                value={cancelReason}
                                onChange={(event) => onCancelReasonChange(event.target.value)}
                                rows="4"
                                maxLength={300}
                                placeholder="Informe o motivo do cancelamento"
                            />
                            <span className={cancelLimitReached ? 'textarea-counter textarea-counter--limit' : 'textarea-counter'}>
                                {cancelReason.length}/300 caracteres
                            </span>
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

export function CellActionMenuModal({ date, minutesFromMidnight, duration, loading, onSchedule, onBlock, onClose }) {
    const timeLabel = minutesToTimeLabel(minutesFromMidnight);
    const endLabel = minutesToTimeLabel(minutesFromMidnight + duration);
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
                    <p className="cell-action-context">Criar horário das {timeLabel} às {endLabel} ({duration} min)</p>
                    <p className="modal-helper-text">O que deseja fazer com este horário?</p>
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

export function UnblockSlotModal({ slot, onClose, onConfirm }) {
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
                    <p className="modal-helper-text">
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
