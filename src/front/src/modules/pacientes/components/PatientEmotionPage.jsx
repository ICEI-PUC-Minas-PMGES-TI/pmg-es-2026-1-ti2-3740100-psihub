import { Loader2, Save } from 'lucide-react';
import { formatDateTime } from '@/shared/utils/date.utils';
import { usePatientEmotion } from '../hooks/usePatientEmotion';

const HUMOR_OPTIONS = [
    { value: 1, label: 'Muito ruim' },
    { value: 2, label: 'Ruim' },
    { value: 3, label: 'Neutro' },
    { value: 4, label: 'Bom' },
    { value: 5, label: 'Muito bom' },
];

export function PatientEmotionPage({ onToast }) {
    const {
        records,
        form,
        setForm,
        editingId,
        loading,
        saving,
        error,
        handleSubmit,
        startEdit,
    } = usePatientEmotion(onToast);

    return (
        <div className="psihome">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">Saúde emocional</p>
                    <h1>Registro Emocional</h1>
                    <p className="agenda-page__subtitle">Registre seu humor e emoções do dia. Edição permitida somente nas primeiras 24 horas.</p>
                </div>
            </header>

            {error && <div className="inline-alert inline-alert--error">{error}</div>}

            <section className="panel">
                <div className="panel__header">
                    <h2>{editingId ? 'Editar registro' : 'Novo registro'}</h2>
                </div>
                <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <span className="form-group__label">Humor do dia</span>
                        <div className="humor-options">
                            {HUMOR_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={Number(form.humorDia) === value ? 'humor-button humor-button--active' : 'humor-button'}
                                    onClick={() => setForm((current) => ({ ...current, humorDia: value }))}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className="form-group">
                        Emoções
                        <input value={form.emocoes} onChange={(event) => setForm((current) => ({ ...current, emocoes: event.target.value }))} placeholder="Separe por vírgula" />
                    </label>
                    <label className="form-group form-group--full">
                        Descrição
                        <textarea rows="4" maxLength={500} value={form.descricao} onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))} />
                    </label>
                    <div className="form-actions">
                        <button className="primary-button primary-button--fit" type="submit" disabled={saving}>
                            {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Salvar
                        </button>
                    </div>
                </form>
            </section>

            <section className="panel">
                <div className="panel__header">
                    <h2>Histórico emocional</h2>
                </div>
                {loading ? <p className="state-row"><Loader2 className="spin" size={16} /> Carregando</p> : records.length === 0 ? (
                    <p className="empty-state">Nenhum registro emocional encontrado.</p>
                ) : (
                    <div className="simple-list">
                        {records.map((record) => (
                            <article className="simple-list__item" key={record.id}>
                                <div>
                                    <strong>{formatDateTime(record.registradoEm)} | Humor {record.humorDia}/5</strong>
                                    <span>{(record.emocoes || []).join(', ') || 'Sem emoções informadas'}</span>
                                    {record.descricao && <span>{record.descricao}</span>}
                                </div>
                                {isEditable(record.registradoEm) && (
                                    <button className="secondary-button" type="button" onClick={() => startEdit(record)}>Editar</button>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function isEditable(value) {
    if (!value) return false;
    return Date.now() - new Date(value).getTime() <= 24 * 60 * 60 * 1000;
}
