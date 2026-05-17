import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { clinicalApi } from '../../api/clinicalApi.js';

const emptyProfile = {
    nome: '',
    telefone: '',
    fotoPerfilUrl: '',
    dataNascimento: '',
    observacoesIniciais: '',
};

export function PatientProfilePage({ onToast }) {
    const [form, setForm] = useState(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        clinicalApi.getPatientProfile(controller.signal)
            .then((profile) => {
                setForm({
                    nome: profile.nome || '',
                    telefone: profile.telefone || '',
                    fotoPerfilUrl: profile.fotoPerfilUrl || '',
                    dataNascimento: profile.dataNascimento || '',
                    observacoesIniciais: profile.observacoesIniciais || '',
                });
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message || 'Nao foi possivel carregar o perfil.');
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!form.nome.trim() || !form.dataNascimento) {
            setError('Nome e data de nascimento sao obrigatorios.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await clinicalApi.updatePatientProfile({
                nome: form.nome,
                telefone: form.telefone || null,
                fotoPerfilUrl: form.fotoPerfilUrl || null,
                dataNascimento: form.dataNascimento,
                observacoesIniciais: form.observacoesIniciais || null,
            });
            onToast?.({ type: 'success', message: 'Perfil atualizado.' });
        } catch (err) {
            setError(err.message || 'Nao foi possivel salvar o perfil.');
        } finally {
            setSaving(false);
        }
    }

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    if (loading) {
        return <section className="panel"><p className="state-row"><Loader2 className="spin" size={16} /> Carregando perfil</p></section>;
    }

    return (
        <div className="psihome">
            <h1>Perfil</h1>
            <p>Atualize seus dados cadastrais usados no atendimento.</p>

            <section className="panel">
                {error && <div className="inline-alert inline-alert--error">{error}</div>}
                <form className="form-grid" onSubmit={handleSubmit}>
                    <label className="form-group">
                        Nome
                        <input value={form.nome} onChange={(event) => updateField('nome', event.target.value)} maxLength={150} required />
                    </label>
                    <label className="form-group">
                        Telefone
                        <input value={form.telefone} onChange={(event) => updateField('telefone', event.target.value)} maxLength={30} />
                    </label>
                    <label className="form-group">
                        Data de nascimento
                        <input type="date" value={form.dataNascimento} onChange={(event) => updateField('dataNascimento', event.target.value)} required />
                    </label>
                    <label className="form-group form-group--full">
                        URL da foto
                        <input value={form.fotoPerfilUrl} onChange={(event) => updateField('fotoPerfilUrl', event.target.value)} maxLength={500} />
                    </label>
                    <label className="form-group form-group--full">
                        Observacoes iniciais
                        <textarea rows="4" maxLength={300} value={form.observacoesIniciais} onChange={(event) => updateField('observacoesIniciais', event.target.value)} />
                    </label>
                    <div className="form-actions">
                        <button className="btn btn--primary" type="submit" disabled={saving}>
                            {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Salvar
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
