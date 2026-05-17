import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Search, X } from 'lucide-react';
import { clinicalApi } from '../../api/clinicalApi.js';
import { schedulingApi } from '../../api/schedulingApi.js';

export function PatientsManagementPage({ onToast }) {
    const [patients, setPatients] = useState([]);
    const [links, setLinks] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async (signal) => {
        setLoading(true);
        try {
            const [patientList, linkList] = await Promise.all([
                schedulingApi.listMyPatients({ signal }),
                clinicalApi.listPsychologistLinks({ status: 'SOLICITADO', signal }),
            ]);
            setPatients(patientList || []);
            setLinks(linkList || []);
            setError('');
        } catch (err) {
            if (err.name !== 'AbortError') setError(err.message || 'Nao foi possivel carregar pacientes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    async function reloadBySearch(event) {
        event.preventDefault();
        setLoading(true);
        try {
            setPatients(await schedulingApi.listMyPatients({ nome: search.trim() }));
            setError('');
        } catch (err) {
            setError(err.message || 'Nao foi possivel buscar pacientes.');
        } finally {
            setLoading(false);
        }
    }

    async function respond(vinculoId, action) {
        try {
            if (action === 'accept') await clinicalApi.acceptLink(vinculoId);
            if (action === 'reject') await clinicalApi.rejectLink(vinculoId);
            onToast?.({ type: 'success', message: 'Solicitacao atualizada.' });
            await load();
        } catch (err) {
            onToast?.({ type: 'error', message: err.message || 'Nao foi possivel atualizar o vinculo.' });
        }
    }

    return (
        <div className="psihome">
            <h1>Pacientes</h1>
            <p>Gerencie vinculos aceitos e solicitacoes de atendimento.</p>

            {error && <div className="inline-alert inline-alert--error">{error}</div>}

            <section className="panel">
                <div className="panel__header">
                    <h2>Solicitacoes pendentes</h2>
                </div>
                {loading ? <LoadingRow /> : links.length === 0 ? <p className="empty-state">Nenhuma solicitacao pendente.</p> : (
                    <div className="simple-list">
                        {links.map((link) => (
                            <article className="simple-list__item" key={link.id}>
                                <div>
                                    <strong>{link.pacienteNome}</strong>
                                    <span>{link.pacienteEmail}</span>
                                </div>
                                <div className="row-actions">
                                    <button className="btn btn--primary" type="button" onClick={() => respond(link.id, 'accept')}>
                                        <Check size={16} /> Aceitar
                                    </button>
                                    <button className="btn btn--secondary" type="button" onClick={() => respond(link.id, 'reject')}>
                                        <X size={16} /> Recusar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="panel">
                <div className="panel__header">
                    <h2>Pacientes vinculados</h2>
                </div>
                <form className="inline-form" onSubmit={reloadBySearch}>
                    <label>
                        Buscar por nome
                        <input value={search} onChange={(event) => setSearch(event.target.value)} />
                    </label>
                    <button className="primary-button primary-button--fit" type="submit">
                        <Search size={16} /> Buscar
                    </button>
                </form>
                {loading ? <LoadingRow /> : patients.length === 0 ? <p className="empty-state">Nenhum paciente com vinculo aceito.</p> : (
                    <div className="simple-list">
                        {patients.map((patient) => (
                            <article className="simple-list__item" key={patient.id}>
                                <div>
                                    <strong>{patient.nome}</strong>
                                    <span>ID clinico: {patient.id}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function LoadingRow() {
    return <p className="state-row"><Loader2 className="spin" size={16} /> Carregando</p>;
}
