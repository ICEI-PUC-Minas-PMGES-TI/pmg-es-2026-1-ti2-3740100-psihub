import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { formatDateTime } from '@/shared/utils/date.utils';

export function ModalRegistrarPagamento({ consultas, onConfirm, onClose }) {
    const panelRef = useRef(null);
    const [consultaId, setConsultaId] = useState('');
    const [valor, setValor] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('');

    const isValid = consultaId !== '' && valor !== '' && parseFloat(valor) > 0 && formaPagamento !== '';

    function handleSubmit(event) {
        event.preventDefault();
        if (!isValid) return;
        onConfirm({
            consultaId: Number(consultaId),
            valor: parseFloat(valor),
            formaPagamento,
        });
    }

    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div
                ref={panelRef}
                className="modal-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Registrar pagamento"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-panel__header">
                    <div>
                        <p className="eyebrow">Financeiro</p>
                        <h3>Registrar Pagamento</h3>
                    </div>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </div>

                <form className="stack-form" onSubmit={handleSubmit}>
                    <label className="field">
                        Consulta concluída
                        <select
                            value={consultaId}
                            onChange={(event) => setConsultaId(event.target.value)}
                            required
                        >
                            <option value="">Selecione uma consulta</option>
                            {consultas.map((consulta) => (
                                <option key={consulta.id} value={consulta.id}>
                                    {consulta.pacienteNome} — {formatDateTime(consulta.inicioEm)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="field">
                        Valor (R$)
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0,00"
                            value={valor}
                            onChange={(event) => setValor(event.target.value)}
                            required
                        />
                    </label>

                    <label className="field">
                        Forma de pagamento
                        <select
                            value={formaPagamento}
                            onChange={(event) => setFormaPagamento(event.target.value)}
                            required
                        >
                            <option value="">Selecione</option>
                            <option value="PIX">PIX</option>
                            <option value="CARTAO">Cartão</option>
                            <option value="DINHEIRO">Dinheiro</option>
                        </select>
                    </label>

                    <div className="inline-actions inline-actions--spread">
                        <button className="ghost-button" type="button" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            className="primary-button primary-button--fit"
                            type="submit"
                            disabled={!isValid}
                        >
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
