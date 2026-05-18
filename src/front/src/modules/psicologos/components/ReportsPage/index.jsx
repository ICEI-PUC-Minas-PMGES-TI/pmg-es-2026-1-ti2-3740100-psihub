import { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { clinicalApi } from '@/services/clinical.service';
import { schedulingApi } from '@/services/scheduling.service';
import { formatDateTime } from '@/shared/utils/date.utils';

export function ReportsPage({ onToast }) {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [timeline, setTimeline] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        schedulingApi.listMyPatients({ signal: controller.signal })
            .then((data) => {
                setPatients(data || []);
                setSelectedPatient(data?.[0]?.id ? String(data[0].id) : '');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message || 'Nao foi possivel carregar pacientes.');
            })
            .finally(() => setLoadingPatients(false));
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!selectedPatient) {
            setTimeline([]);
            return undefined;
        }
        const controller = new AbortController();
        setLoadingTimeline(true);
        clinicalApi.getTimeline({ pacienteId: selectedPatient, signal: controller.signal })
            .then((data) => {
                setTimeline(data || []);
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Nao foi possivel carregar a evolucao.');
                    onToast?.({ type: 'error', message: 'Acesso clinico negado sem vinculo aceito.' });
                }
            })
            .finally(() => setLoadingTimeline(false));
        return () => controller.abort();
    }, [selectedPatient, onToast]);

    return (
        <div className="psihome">
            <h1>Relatorios e Evolucao</h1>
            <p>Consulte linha do tempo clinica somente para pacientes com vinculo aceito.</p>

            {error && <div className="inline-alert inline-alert--error">{error}</div>}

            <section className="panel">
                <div className="panel__header">
                    <h2><FileText size={20} /> Linha do tempo</h2>
                </div>

                <label className="field">
                    Paciente vinculado
                    <select value={selectedPatient} onChange={(event) => setSelectedPatient(event.target.value)} disabled={loadingPatients}>
                        <option value="">Selecione</option>
                        {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>{patient.nome}</option>
                        ))}
                    </select>
                </label>

                {loadingTimeline ? <p className="state-row"><Loader2 className="spin" size={16} /> Carregando evolucao</p> : timeline.length === 0 ? (
                    <p className="empty-state">Nenhum registro de evolucao para o filtro atual.</p>
                ) : (
                    <div className="simple-list">
                        {timeline.map((item) => (
                            <article className="simple-list__item" key={item.id}>
                                <div>
                                    <strong>{formatDateTime(item.inicioEm)}</strong>
                                    <span>{(item.temasSessao || []).join(', ') || 'Sem temas registrados'}</span>
                                </div>
                                <span>Progresso: {item.nivelProgresso != null ? `${item.nivelProgresso}/10` : 'Não informado'}</span>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}


