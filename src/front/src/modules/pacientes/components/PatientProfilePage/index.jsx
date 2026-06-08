import { Loader2, Save } from 'lucide-react';
import { usePatientProfile } from '../../hooks/patient/usePatientProfile';

export function PatientProfilePage({ onToast }) {
    const {
        form,
        loading,
        saving,
        error,
        handleSubmit,
        updateField,
    } = usePatientProfile(onToast);

    if (loading) {
        return (
            <div className="psihome">
                <header className="agenda-page__header panel">
                    <div>
                        <p className="eyebrow">Minha conta</p>
                        <h1>Perfil</h1>
                        <p className="agenda-page__subtitle">Atualize seus dados cadastrais usados no atendimento.</p>
                    </div>
                </header>
                <section className="panel">
                    <p className="state-row"><Loader2 className="spin" size={16} /> Carregando perfilâ€¦</p>
                </section>
            </div>
        );
    }

    return (
        <div className="psihome">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">Minha conta</p>
                    <h1>Perfil</h1>
                    <p className="agenda-page__subtitle">Atualize seus dados cadastrais usados no atendimento.</p>
                </div>
            </header>

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
                        <button className="primary-button primary-button--fit" type="submit" disabled={saving}>
                            {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Salvar
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
