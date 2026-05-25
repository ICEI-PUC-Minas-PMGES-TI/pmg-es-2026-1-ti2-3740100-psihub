import { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { clinicalApi } from '@/services/clinical.service';
import { schedulingApi } from '@/services/scheduling.service';
import { formatDateTime } from '@/shared/utils/date.utils';

export function ReportsPage({ onToast, initialPatientId }) {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(() =>
        initialPatientId ? String(initialPatientId) : ''
    );
    const [timeline, setTimeline] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        schedulingApi.listMyPatients({ signal: controller.signal })
            .then((data) => {
                setPatients(data || []);
                setSelectedPatient((prev) => prev || (data?.[0]?.id ? String(data[0].id) : ''));
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message || 'Não foi possível carregar pacientes.');
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
                    setError(err.message || 'Não foi possível carregar a evolução.');
                    onToast?.({ type: 'error', message: 'Acesso clínico negado sem vínculo aceito.' });
                }
            })
            .finally(() => setLoadingTimeline(false));
        return () => controller.abort();
    }, [selectedPatient, onToast]);

    return (
        <div className="psihome">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">Relatórios</p>
                    <h1>Relatórios e Evolução</h1>
                    <p className="agenda-page__subtitle">Consulte a linha do tempo clínica somente para pacientes com vínculo aceito.</p>
                </div>
            </header>

            {error && <div className="inline-alert inline-alert--error">{error}</div>}

            <section className="panel">
                <div className="panel__header">
                    <h2>Linha do tempo</h2>
                    <FileText size={20} />
                </div>

                <label className="field">
                    Paciente vinculado
                    <select
                        value={selectedPatient}
                        onChange={(event) => setSelectedPatient(event.target.value)}
                        disabled={loadingPatients}
                    >
                        <option value="">Selecione</option>
                        {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>{patient.nome}</option>
                        ))}
                    </select>
                </label>

                {loadingTimeline ? (
                    <p className="state-row"><Loader2 className="spin" size={16} /> Carregando evolução…</p>
                ) : timeline.length === 0 ? (
                    <p className="empty-state">Nenhum registro de evolução para o filtro atual.</p>
                ) : (
                    <div className="simple-list" style={{ marginTop: '12px' }}>
                        {timeline.map((item) => (
                            <div className="simple-list__item" key={item.id}>
                                <div>
                                    <strong>{formatDateTime(item.inicioEm)}</strong>
                                    <span>{(item.temasSessao || []).join(', ') || 'Sem temas registrados'}</span>
                                </div>
                                <span>Progresso: {item.nivelProgresso != null ? `${item.nivelProgresso}/10` : 'Não informado'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

