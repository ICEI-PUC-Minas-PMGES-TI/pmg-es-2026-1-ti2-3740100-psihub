import { X } from 'lucide-react';
import { useState } from 'react';
import '../RecordAnnotationModal/styles.css';

export function EvolutionRecordModal({ isOpen, onClose, onSubmit, pacienteNome }) {
    const [form, setForm] = useState({
        titulo: '',
        temasSessao: '',
        observacaoClinica: '',
        nivelEngajamento: 'NEUTRO',
        nivelProgresso: 5,
        intercorrencias: '',
        tarefas: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: ['nivelProgresso'].includes(name) ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.observacaoClinica.trim()) {
            setError('Observação clínica é obrigatória');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await onSubmit(form);
            setForm({
                titulo: '',
                temasSessao: '',
                observacaoClinica: '',
                nivelEngajamento: 'NEUTRO',
                nivelProgresso: 5,
                intercorrencias: '',
                tarefas: ''
            });
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
                    <h2>Novo Registro de Evolução</h2>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {pacienteNome && (
                    <div className="modal-info">
                        <p className="info-line">
                            <span className="info-label">Paciente:</span>
                            <span className="info-value">{pacienteNome}</span>
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="inline-alert inline-alert--error">{error}</div>}

                    <label className="field">
                        Título do Registro
                        <input
                            type="text"
                            name="titulo"
                            value={form.titulo}
                            onChange={handleChange}
                            placeholder="Ex: Sessão de análise comportamental"
                            disabled={loading}
                        />
                    </label>

                    <label className="field">
                        Temas da Sessão (separados por vírgula)
                        <input
                            type="text"
                            name="temasSessao"
                            value={form.temasSessao}
                            onChange={handleChange}
                            placeholder="Ex: Ansiedade, Autoestima, Relacionamentos"
                            disabled={loading}
                        />
                    </label>

                    <label className="field">
                        Observação Clínica
                        <textarea
                            name="observacaoClinica"
                            value={form.observacaoClinica}
                            onChange={handleChange}
                            placeholder="Descreva a evolução clínica, comportamentos observados, progresso do paciente..."
                            rows={6}
                            disabled={loading}
                            required
                        />
                    </label>

                    <label className="field">
                        Nível de Engajamento
                        <select
                            name="nivelEngajamento"
                            value={form.nivelEngajamento}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="MUITO_BAIXO">Muito Baixo</option>
                            <option value="BAIXO">Baixo</option>
                            <option value="NEUTRO">Neutro</option>
                            <option value="ALTO">Alto</option>
                            <option value="MUITO_ALTO">Muito Alto</option>
                        </select>
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

                    <label className="field">
                        Intercorrências
                        <textarea
                            name="intercorrencias"
                            value={form.intercorrencias}
                            onChange={handleChange}
                            placeholder="Descreva qualquer evento inesperado ou relevante durante a sessão"
                            rows={3}
                            disabled={loading}
                        />
                    </label>

                    <label className="field">
                        Tarefas / Encaminhamentos
                        <textarea
                            name="tarefas"
                            value={form.tarefas}
                            onChange={handleChange}
                            placeholder="Descreva as tarefas para casa ou encaminhamentos para o próximo encontro"
                            rows={3}
                            disabled={loading}
                        />
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
                            {loading ? 'Salvando...' : 'Criar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

