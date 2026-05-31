import { FileText, Loader2 } from 'lucide-react';
import { formatDateTime } from '@/shared/utils/date.utils';
import { useReports } from '../../hooks/useReports';

export function ReportsPage({ onToast, initialPatientId }) {
    const {
        patients,
        selectedPatient,
        setSelectedPatient,
        timeline,
        loadingPatients,
        loadingTimeline,
        error,
    } = useReports({ initialPatientId, onToast });

    return (
        <div className="psihome">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">RelatÃ³rios</p>
                    <h1>RelatÃ³rios e EvoluÃ§Ã£o</h1>
                    <p className="agenda-page__subtitle">Consulte a linha do tempo clÃ­nica somente para pacientes com vÃ­nculo aceito.</p>
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
                    <p className="state-row"><Loader2 className="spin" size={16} /> Carregando evoluÃ§Ã£oâ€¦</p>
                ) : timeline.length === 0 ? (
                    <p className="empty-state">Nenhum registro de evoluÃ§Ã£o para o filtro atual.</p>
                ) : (
                    <div className="simple-list" style={{ marginTop: '12px' }}>
                        {timeline.map((item) => (
                            <div className="simple-list__item" key={item.id}>
                                <div>
                                    <strong>{formatDateTime(item.inicioEm)}</strong>
                                    <span>{(item.temasSessao || []).join(', ') || 'Sem temas registrados'}</span>
                                </div>
                                <span>Progresso: {item.nivelProgresso != null ? `${item.nivelProgresso}/10` : 'NÃ£o informado'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
