import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import {
    addMonths,
    buildCalendarDays,
    formatDate,
    formatMonth,
    formatTime,
    isBeforeToday,
    toIsoDate,
} from '@/shared/utils/date.utils';
import { getSlotInicio, getSlotKey } from '../../utils/patient.utils';
import { EmptyState } from '../PatientStates';

export function CalendarioConsultas({
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
                    <button className="icon-button" type="button" onClick={() => onMonthChange(addMonths(currentMonth, -1))} aria-label="Mes anterior">
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <p className="eyebrow">{psychologist.nome}</p>
                        <h2>{formatMonth(currentMonth)}</h2>
                    </div>
                    <button className="icon-button" type="button" onClick={() => onMonthChange(addMonths(currentMonth, 1))} aria-label="Proximo mes">
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
                        <p className="eyebrow">Horarios</p>
                        <h2>{selectedDateKey ? formatDate(`${selectedDateKey}T00:00:00`) : 'Selecione uma data'}</h2>
                    </div>
                </div>

                {!selectedDateKey && <EmptyState icon={Clock} title="Escolha uma data futura no calendario." />}
                {selectedDateKey && daySlots.length === 0 && <EmptyState icon={Clock} title="Nao ha horarios disponiveis nessa data." />}

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
                        Selecionar horario
                    </button>
                </div>
            </section>
        </div>
    );
}
