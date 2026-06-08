import { CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '@/shared/utils/date.utils';

const TIPO_LABEL = {
    ONLINE: 'Online',
    PRESENCIAL: 'Presencial',
};

export function ModalConfirmacaoAgendamento({ consulta, onClose }) {
    return (
        <div className="modal-backdrop">
            <div className="modal-panel" style={{ textAlign: 'center', maxWidth: 420 }}>
                <div className="modal-panel__header">
                    <h2>Agendamento confirmado</h2>
                </div>

                <div style={{ padding: '24px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <CheckCircle2 size={52} color="#16a34a" strokeWidth={1.5} aria-hidden="true" />

                    <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
                        Consulta agendada com sucesso!
                    </p>

                    <dl className="summary-list" style={{ width: '100%', textAlign: 'left' }}>
                        <div>
                            <dt>Psicólogo</dt>
                            <dd>{consulta.psicologoNome}</dd>
                        </div>
                        <div>
                            <dt>Data e horário</dt>
                            <dd>{formatDateTime(consulta.inicioEm)}</dd>
                        </div>
                        <div>
                            <dt>Tipo de atendimento</dt>
                            <dd>{TIPO_LABEL[consulta.tipoAtendimento] ?? consulta.tipoAtendimento}</dd>
                        </div>
                    </dl>

                    <button
                        className="primary-button primary-button--fit"
                        type="button"
                        style={{ marginTop: 8 }}
                        onClick={onClose}
                    >
                        Voltar ao início
                    </button>
                </div>
            </div>
        </div>
    );
}
