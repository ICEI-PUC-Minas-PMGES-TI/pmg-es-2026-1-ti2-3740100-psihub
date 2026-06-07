import { X } from 'lucide-react';
import { useState } from 'react';
import './RecordAnnotationModal.css';

export function RecordAnnotationModal({ isOpen, onClose, onSubmit, registroData }) {
    const [form, setForm] = useState({ titulo: '', observacao: '', nivelProgresso: 5 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'nivelProgresso' ? Number(value) : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.observacao.trim()) {
            setError('Observação é obrigatória');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await onSubmit(form);
            setForm({ titulo: '', observacao: '', nivelProgresso: 5 });
        } catch (err) {
            setError(err.message || 'Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Adicionar Anotação ao Registro</h2>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {registroData && (
                    <div className="modal-info">
                        <p className="info-line">
                            <span className="info-label">Paciente:</span>
                            <span className="info-value">{registroData.pacienteNome}</span>
                        </p>
                        <p className="info-line">
                            <span className="info-label">Data do Registro:</span>
                            <span className="info-value">{registroData.dataRegistro}</span>
                        </p>
                        <p className="info-line">
                            <span className="info-label">Humor:</span>
                            <span className="info-value">Nível {registroData.humorDia}</span>
                        </p>
                        {registroData.descricao && (
                            <p className="info-line">
                                <span className="info-label">Observação do paciente:</span>
                                <span className="info-value">{registroData.descricao}</span>
                            </p>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="inline-alert inline-alert--error">{error}</div>}

                    <label className="field">
                        Título da Anotação
                        <input
                            type="text"
                            name="titulo"
                            value={form.titulo}
                            onChange={handleChange}
                            placeholder="Ex: Análise de humor deprimido"
                            disabled={loading}
                        />
                    </label>

                    <label className="field">
                        Observação / Anotação Clínica
                        <textarea
                            name="observacao"
                            value={form.observacao}
                            onChange={handleChange}
                            placeholder="Digite aqui sua anotação clínica ou evolução do paciente..."
                            rows={6}
                            disabled={loading}
                            required
                        />
                    </label>

                    <label className="field">
                        Nível de Progresso
                        <input
                            type="range"
                            name="nivelProgresso"
                            min="1"
                            max="10"
                            value={form.nivelProgresso}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <span className="range-value">{form.nivelProgresso} / 10</span>
                    </label>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Anotação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

