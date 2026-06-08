import { CalendarCheck } from 'lucide-react';
import { formatDateTime } from '@/shared/utils/date.utils';
import { getSlotInicio } from '../utils/patient.utils';

export function ProximaConsultaCard({ psychologist, slot, onHome }) {
    return (
        <section className="panel narrow-panel success-panel">
            <CalendarCheck size={42} />
            <h2>Consulta agendada com sucesso</h2>
            <p>{formatDateTime(getSlotInicio(slot))} com {psychologist.nome}</p>
            <button className="primary-button primary-button--fit" type="button" onClick={onHome}>Voltar ao inicio</button>
        </section>
    );
}
