import { X } from 'lucide-react';

export function ModalCancelarConsulta({
    appointment,
    cancelReason,
    submitting,
    onCancelReasonChange,
    onAbortCancel,
    onConfirmCancel,
}) {
    return (
        <div className="cancel-box">
            <label className="cancel-box__label">
                Motivo do cancelamento
                <textarea
                    rows={2}
                    maxLength={300}
                    placeholder="Descreva o motivo do cancelamento (opcional)"
                    value={cancelReason}
                    onChange={(event) => onCancelReasonChange(event.target.value)}
                />
            </label>
            <div className="inline-actions">
                <button className="danger-button" type="button" disabled={submitting} onClick={() => onConfirmCancel(appointment)}>
                    <X size={16} />
                    Confirmar cancelamento
                </button>
                <button className="ghost-button" type="button" onClick={onAbortCancel}>Voltar</button>
            </div>
        </div>
    );
}
