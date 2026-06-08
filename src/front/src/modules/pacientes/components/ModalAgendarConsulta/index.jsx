import { CalendarCheck, Loader2 } from 'lucide-react';
import { formatDateTime } from '@/shared/utils/date.utils';
import { getSlotInicio } from '../../utils/patient.utils';

export function ModalAgendarConsulta({
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
                Observações
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
