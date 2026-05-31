import { useState } from 'react';
import { Star } from 'lucide-react';
import { schedulingApi } from '@/services/scheduling.service';

/**
 * Modal para o paciente avaliar uma consulta concluída.
 *
 * Props:
 *   consulta  – { id, psicologoNome }
 *   onClose() – fecha o modal sem avaliação
 *   onSuccess(avaliacao) – chamado após envio bem-sucedido
 *   onToast({ type, message }) – (opcional)
 */
export function AvaliacaoConsultaModal({ consulta, onClose, onSuccess, onToast }) {
    const [nota, setNota] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comentario, setComentario] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        if (nota === 0) {
            setErro('Selecione uma nota de 1 a 5 estrelas.');
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
            onToast?.({ type: 'success', message: 'Avaliação enviada. Obrigado!' });
            onSuccess?.(avaliacao);
        } catch (err) {
            const msg = err.message || 'Erro ao enviar avaliação.';
            setErro(msg);
            onToast?.({ type: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    }

    const displayNota = hovered || nota;

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Avaliar consulta">
            <div className="modal-panel" style={{ maxWidth: 440 }}>
                <header className="modal-panel__header">
                    <h2>Avaliar Consulta</h2>
                    <button
                        type="button"
                        className="ghost-button"
                        aria-label="Fechar"
                        onClick={onClose}
                        disabled={loading}
                    >
                        ✕
                    </button>
                </header>

                <form onSubmit={handleSubmit} style={{ padding: '16px 0' }}>
                    <p style={{ marginBottom: 8, color: '#374151' }}>
                        Como foi sua consulta com <strong>{consulta.psicologoNome}</strong>?
                    </p>

                    {/* Star rating */}
                    <div
                        style={{ display: 'flex', gap: 6, marginBottom: 16 }}
                        role="group"
                        aria-label="Nota de 1 a 5"
                    >
                        {[1, 2, 3, 4, 5].map((estrela) => (
                            <button
                                key={estrela}
                                type="button"
                                aria-label={`${estrela} estrela${estrela > 1 ? 's' : ''}`}
                                aria-pressed={nota === estrela}
                                onClick={() => setNota(estrela)}
                                onMouseEnter={() => setHovered(estrela)}
                                onMouseLeave={() => setHovered(0)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                            >
                                <Star
                                    size={32}
                                    fill={estrela <= displayNota ? '#f59e0b' : 'none'}
                                    color={estrela <= displayNota ? '#f59e0b' : '#9ca3af'}
                                />
                            </button>
                        ))}
                    </div>

                    <label className="field">
                        Comentário (opcional)
                        <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            maxLength={300}
                            rows={4}
                            placeholder="Compartilhe sua experiência…"
                            disabled={loading}
                        />
                        <span style={{ fontSize: 12, color: '#6b7280', textAlign: 'right', display: 'block' }}>
                            {comentario.length}/300
                        </span>
                    </label>

                    {erro && <div className="inline-alert inline-alert--error">{erro}</div>}

                    <div className="inline-actions inline-actions--spread" style={{ marginTop: 16 }}>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Agora não
                        </button>
                        <button
                            type="submit"
                            className="primary-button primary-button--fit"
                            disabled={loading || nota === 0}
                        >
                            {loading ? 'Enviando…' : 'Enviar avaliação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
