import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { clinicalApi } from '@/services/clinical.service';

const initialForm = {
    humorDia: 3,
    emocoes: '',
    descricao: '',
};

export function PatientEmotionPage({ onToast }) {
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        clinicalApi.listEmotionRecords(controller.signal)
            .then((data) => {
                setRecords(data || []);
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message || 'Nao foi possivel carregar registros.');
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        if (Number(form.humorDia) < 1 || Number(form.humorDia) > 5) {
            setError('Humor deve estar entre 1 e 5.');
            return;
        }

        setSaving(true);
        setError('');
        const payload = {
            humorDia: Number(form.humorDia),
            descricao: form.descricao || null,
            emocoes: form.emocoes.split(',').map((item) => item.trim()).filter(Boolean),
        };

        try {
            if (editingId) {
                await clinicalApi.updateEmotionRecord(editingId, payload);
            } else {
                await clinicalApi.createEmotionRecord(payload);
            }
            setRecords(await clinicalApi.listEmotionRecords());
            setForm(initialForm);
            setEditingId(null);
            onToast?.({ type: 'success', message: 'Registro emocional salvo.' });
        } catch (err) {
            setError(err.message || 'Nao foi possivel salvar o registro.');
        } finally {
            setSaving(false);
        }
    }

    function startEdit(record) {
        setEditingId(record.id);
        setForm({
            humorDia: record.humorDia,
            descricao: record.descricao || '',
            emocoes: (record.emocoes || []).join(', '),
        });
    }

    return (
        <div className="psihome">
            <h1>Registro Emocional</h1>
            <p>Registre humor e emocoes do dia. Edicao permitida somente nas primeiras 24 horas.</p>

            {error && <div className="inline-alert inline-alert--error">{error}</div>}

            <section className="panel">
                <div className="panel__header">
                    <h2>{editingId ? 'Editar registro' : 'Novo registro'}</h2>
                </div>
                <form className="form-grid" onSubmit={handleSubmit}>
                    <label className="form-group">
                        Humor do dia
                        <input type="number" min="1" max="5" value={form.humorDia} onChange={(event) => setForm((current) => ({ ...current, humorDia: event.target.value }))} required />
                    </label>
                    <label className="form-group">
                        Emocoes
                        <input value={form.emocoes} onChange={(event) => setForm((current) => ({ ...current, emocoes: event.target.value }))} placeholder="Separe por virgula" />
                    </label>
                    <label className="form-group form-group--full">
                        Descricao
                        <textarea rows="4" maxLength={500} value={form.descricao} onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))} />
                    </label>
                    <div className="form-actions">
                        <button className="btn btn--primary" type="submit" disabled={saving}>
                            {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Salvar
                        </button>
                    </div>
                </form>
            </section>

            <section className="panel">
                <div className="panel__header">
                    <h2>Historico emocional</h2>
                </div>
                {loading ? <p className="state-row"><Loader2 className="spin" size={16} /> Carregando</p> : records.length === 0 ? (
                    <p className="empty-state">Nenhum registro emocional encontrado.</p>
                ) : (
                    <div className="simple-list">
                        {records.map((record) => (
                            <article className="simple-list__item" key={record.id}>
                                <div>
                                    <strong>{formatDateTime(record.registradoEm)} | Humor {record.humorDia}/5</strong>
                                    <span>{(record.emocoes || []).join(', ') || 'Sem emocoes informadas'}</span>
                                    {record.descricao && <span>{record.descricao}</span>}
                                </div>
                                {isEditable(record.registradoEm) && (
                                    <button className="btn btn--secondary" type="button" onClick={() => startEdit(record)}>Editar</button>
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

function formatDateTime(value) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
