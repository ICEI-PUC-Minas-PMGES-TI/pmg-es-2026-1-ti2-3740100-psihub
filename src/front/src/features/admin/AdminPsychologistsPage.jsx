import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { clinicalApi } from '../../api/clinicalApi.js';

export function AdminPsychologistsPage({ onToast }) {
    const [status, setStatus] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        clinicalApi.listAdminPsychologists({ status, signal: controller.signal })
            .then((data) => {
                setItems(data || []);
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message || 'Nao foi possivel carregar psicologos.');
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, [status]);

    async function changeAccess(psicologoId, action) {
        try {
            if (action === 'approve') await clinicalApi.approvePsychologist(psicologoId);
            if (action === 'revoke') await clinicalApi.revokePsychologist(psicologoId, 'Revogado via painel administrativo');
            onToast?.({ type: 'success', message: 'Acesso atualizado.' });
            setItems(await clinicalApi.listAdminPsychologists({ status }));
        } catch (err) {
            onToast?.({ type: 'error', message: err.message || 'Nao foi possivel atualizar o acesso.' });
        }
    }

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
                                    <span>{item.email} | {item.crp} | {item.statusAcesso}</span>
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
