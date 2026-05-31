import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { useAdminPsychologists } from '../../hooks/useAdminPsychologists';

const accessStatusLabels = {
    PENDENTE: 'Pendente',
    ATIVO: 'Ativo',
    REVOGADO: 'Revogado',
};

export function AdminPsychologistsPage({ onToast }) {
    const {
        status,
        setStatus,
        items,
        loading,
        error,
        changeAccess,
    } = useAdminPsychologists(onToast);

    return (
        <div className="psihome">
            <h1>Gestao de Psicologos</h1>
            <p>Aprove ou revogue acesso sem acessar prontuarios ou registros clinicos.</p>

            <section className="panel">
                <div className="panel__header">
                    <h2><ShieldCheck size={20} /> Controle de acesso</h2>
                </div>

                <label className="field">
                    Status
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="">Todos</option>
                        <option value="PENDENTE">Pendente</option>
                        <option value="ATIVO">Ativo</option>
                        <option value="REVOGADO">Revogado</option>
                    </select>
                </label>

                {error && <div className="inline-alert inline-alert--error">{error}</div>}
                {loading ? <p className="state-row"><Loader2 className="spin" size={16} /> Carregando</p> : items.length === 0 ? (
                    <p className="empty-state">Nenhum psicologo encontrado.</p>
                ) : (
                    <div className="simple-list">
                        {items.map((item) => (
                            <article className="simple-list__item" key={item.id}>
                                <div>
                                    <strong>{item.nome}</strong>
                                    <span>{item.email} | {item.crp} | {accessStatusLabels[item.statusAcesso] ?? item.statusAcesso}</span>
                                </div>
                                <div className="row-actions">
                                    <button className="btn btn--primary" type="button" onClick={() => changeAccess(item.id, 'approve')} disabled={item.statusAcesso === 'ATIVO'}>
                                        <CheckCircle2 size={16} /> Aprovar
                                    </button>
                                    <button className="btn btn--secondary" type="button" onClick={() => changeAccess(item.id, 'revoke')} disabled={item.statusAcesso === 'REVOGADO'}>
                                        <XCircle size={16} /> Revogar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
