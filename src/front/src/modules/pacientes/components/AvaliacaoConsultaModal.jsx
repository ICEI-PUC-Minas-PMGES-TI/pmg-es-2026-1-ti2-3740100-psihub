import { useState } from 'react';
import { CheckCircle2, Star, X } from 'lucide-react';
import { schedulingApi } from '@/services/scheduling.service';

const CSAT_OPTIONS = [
    { nota: 1, label: 'Péssimo' },
    { nota: 2, label: 'Ruim' },
    { nota: 3, label: 'Regular' },
    { nota: 4, label: 'Bom' },
    { nota: 5, label: 'Ótimo' },
];

export function AvaliacaoConsultaModal({ consulta, onClose, onSuccess, onToast }) {
    const [nota, setNota] = useState(0);
    const [comentario, setComentario] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [enviado, setEnviado] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (nota === 0) {
            setErro('Selecione uma nota para continuar.');
            return;
        }

        setLoading(true);
        setErro('');

        try {
            const avaliacao = await schedulingApi.submitAvaliacao({
                consultaId: consulta.id,
                nota,
                comentario: comentario.trim() || undefined,
            });

            setEnviado(true);
            onSuccess?.(avaliacao);
            onToast?.({ type: 'success', message: 'Avaliação enviada com sucesso.' });
        } catch (error) {
            const message = getAvaliacaoErrorMessage(error);
            setErro(message);
            onToast?.({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    }

    function handleBackdropClick(event) {
        if (!loading && event.target === event.currentTarget) {
            onClose();
        }
    }

    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={handleBackdropClick}>
            <div className="modal-panel csat-modal" role="dialog" aria-modal="true" aria-labelledby="csat-modal-title">
                <header className="modal-panel__header">
                    <div>
                        <p className="eyebrow">Avaliação da consulta</p>
                        <h2 id="csat-modal-title">{enviado ? 'Avaliação enviada' : 'Como foi o atendimento?'}</h2>
                    </div>
                    <button
                        type="button"
                        className="ghost-button"
                        aria-label="Fechar"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X size={18} />
                    </button>
                </header>

                {enviado ? (
                    <div className="csat-success">
                        <CheckCircle2 size={40} />
                        <p>
                            Obrigado pelo retorno sobre sua consulta com <strong>{consulta.psicologoNome}</strong>.
                        </p>
                        <button className="primary-button primary-button--fit" type="button" onClick={onClose}>
                            Fechar
                        </button>
                    </div>
                ) : (
                    <form className="stack-form" onSubmit={handleSubmit}>
                        <p className="csat-modal__description">
                            Selecione uma nota para a consulta com <strong>{consulta.psicologoNome}</strong>.
                        </p>

                        <div className="csat-options" role="radiogroup" aria-label="Nota da consulta">
                            {CSAT_OPTIONS.map((option) => {
                                const selected = nota === option.nota;

                                return (
                                    <button
                                        key={option.nota}
                                        type="button"
                                        role="radio"
                                        aria-checked={selected}
                                        className={selected ? 'csat-option csat-option--selected' : 'csat-option'}
                                        onClick={() => setNota(option.nota)}
                                        disabled={loading}
                                    >
                                        <Star
                                            size={18}
                                            fill={selected ? 'currentColor' : 'none'}
                                            aria-hidden="true"
                                        />
                                        <strong>{option.label}</strong>
                                        <span>{option.nota}/5</span>
                                    </button>
                                );
                            })}
                        </div>

                        <label className="field">
                            Comentário (opcional)
                            <textarea
                                value={comentario}
                                onChange={(event) => setComentario(event.target.value)}
                                maxLength={300}
                                rows={4}
                                placeholder="Compartilhe sua experiência, se quiser."
                                disabled={loading}
                            />
                            <span className="field-hint field-hint--right">{comentario.length}/300</span>
                        </label>

                        {erro && <div className="inline-alert inline-alert--error">{erro}</div>}

                        <div className="inline-actions inline-actions--spread">
                            <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>
                                Agora não
                            </button>
                            <button
                                type="submit"
                                className="primary-button primary-button--fit"
                                disabled={loading || nota === 0}
                            >
                                {loading ? 'Enviando...' : 'Confirmar envio'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function getAvaliacaoErrorMessage(error) {
    if (error?.status === 409) {
        return 'Esta consulta já foi avaliada.';
    }

    if (error?.status === 422) {
        return 'Esta consulta ainda não foi concluída.';
    }

    if (error?.status === 404) {
        return 'Consulta não encontrada.';
    }

    if (error?.name === 'TypeError' || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        return 'Falha de rede. Verifique sua conexão e tente novamente.';
    }

    return error?.message || 'Não foi possível enviar a avaliação.';
}
