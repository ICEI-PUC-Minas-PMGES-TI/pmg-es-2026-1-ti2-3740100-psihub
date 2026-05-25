import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Search, X } from 'lucide-react';
import { clinicalApi } from '@/services/clinical.service';
import { schedulingApi } from '@/services/scheduling.service';

export function PatientsManagementPage({ onToast, onSelectPatient }) {
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
            if (err.name !== 'AbortError') setError(err.message || 'Não foi possível carregar pacientes.');
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
            setError(err.message || 'Não foi possível buscar pacientes.');
        } finally {
            setLoading(false);
        }
    }

    async function respond(vinculoId, action) {
        try {
            if (action === 'accept') await clinicalApi.acceptLink(vinculoId);
            if (action === 'reject') await clinicalApi.rejectLink(vinculoId);
            onToast?.({ type: 'success', message: 'Solicitação atualizada.' });
            await load();
        } catch (err) {
            onToast?.({ type: 'error', message: err.message || 'Não foi possível atualizar o vínculo.' });
        }
    }

    return (
        <div className="psihome">
            <header>
                <h1>Pacientes</h1>
                <p>Gerencie vínculos aceitos e solicitações de atendimento.</p>
            </header>

            {error && <div className="inline-alert inline-alert--error">{error}</div>}

            <section className="panel">
                <div className="panel__header">
                    <h2>Solicitações pendentes</h2>
                </div>

                {loading ? (
                    <p className="state-row"><Loader2 className="spin" size={16} /> Carregando…</p>
                ) : links.length === 0 ? (
                    <p className="empty-state">Nenhuma solicitação pendente.</p>
                ) : (
                    <div className="simple-list">
                        {links.map((link) => (
                            <div className="simple-list__item" key={link.id}>
                                <div>
                                    <strong>{link.pacienteNome}</strong>
                                    <span>{link.pacienteEmail}</span>
                                </div>
                                <div className="inline-actions">
                                    <button
                                        className="primary-button primary-button--fit"
                                        type="button"
                                        onClick={() => respond(link.id, 'accept')}
                                    >
                                        <Check size={16} /> Aceitar
                                    </button>
                                    <button
                                        className="secondary-button"
                                        type="button"
                                        onClick={() => respond(link.id, 'reject')}
                                    >
                                        <X size={16} /> Recusar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="panel">
                <div className="panel__header">
                    <h2>Pacientes vinculados</h2>
                </div>

                <form className="search-bar" onSubmit={reloadBySearch}>
                    <label className="field">
                        Buscar por nome
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Nome do paciente"
                        />
                    </label>
                    <button className="primary-button primary-button--fit" type="submit">
                        <Search size={16} /> Buscar
                    </button>
                </form>

                {loading ? (
                    <p className="state-row"><Loader2 className="spin" size={16} /> Carregando…</p>
                ) : patients.length === 0 ? (
                    <p className="empty-state">Nenhum paciente com vínculo aceito.</p>
                ) : (
                    <div className="simple-list" style={{ marginTop: '12px' }}>
                        {patients.map((patient) => (
                            <div className="simple-list__item" key={patient.id}>
                                <strong>{patient.nome}</strong>
                                <button
                                    className="secondary-button"
                                    type="button"
                                    onClick={() => onSelectPatient?.(patient.id)}
                                >
                                    Ver relatório
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

