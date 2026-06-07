import { useState } from 'react';
import { FileText, Loader2, Plus } from 'lucide-react';
import { formatDateTime } from '@/shared/utils/date.utils';
import { useReports } from '../../hooks/useReports';
import { clinicalApi } from '@/services/clinical.service';
import { RecordAnnotationModal } from '../RecordAnnotationModal';
import { EvolutionRecordModal } from '../EvolutionRecordModal';

export function ReportsPage({ onToast, initialPatientId }) {
    const {
        patients,
        selectedPatient,
        setSelectedPatient,
        timeline,
        records,
        loadingPatients,
        loadingTimeline,
        loadingRecords,
        error,
    } = useReports({ initialPatientId, onToast });

    // Modal states
    const [annotationModalOpen, setAnnotationModalOpen] = useState(false);
    const [evolutionModalOpen, setEvolutionModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Get patient name
    const selectedPatientName = selectedPatient
        ? patients.find(p => String(p.id) === String(selectedPatient))?.nome
        : null;

    // Handle annotation modal
    const handleOpenAnnotationModal = (record) => {
        setSelectedRecord({
            ...record,
            dataRegistro: formatDateTime(record.registradoEm),
            pacienteNome: selectedPatientName
        });
        setAnnotationModalOpen(true);
    };

    const handleSubmitAnnotation = async (formData) => {
        try {
            await clinicalApi.createRecordAnnotation({
                pacienteId: selectedPatient,
                registroId: selectedRecord.id,
                texto: formData.observacao
            });
            onToast?.({ type: 'success', message: 'Anotação salva com sucesso!' });
            setAnnotationModalOpen(false);
            // Reload records to show new annotation
            window.location.reload();
        } catch (err) {
            throw new Error(err.message || 'Falha ao criar anotação');
        }
    };

    // Handle evolution modal
    const handleSubmitEvolution = async (formData) => {
        try {
            const payload = {
                pacienteId: selectedPatient,
                titulo: formData.titulo || 'Sem título',
                temasSessao: formData.temasSessao.split(',').map(t => t.trim()).filter(t => t),
                anotacoesClinicas: formData.observacaoClinica,
                nivelEngajamento: formData.nivelEngajamento,
                nivelProgresso: formData.nivelProgresso,
                intercorrencias: formData.intercorrencias || null,
                tarefasEncaminhamentos: formData.tarefas || null,
            };
            await clinicalApi.createEvolutionRecord(payload);
            onToast?.({ type: 'success', message: 'Registro de evolução criado com sucesso!' });
            setEvolutionModalOpen(false);
            // Reload timeline to show new record
            window.location.reload();
        } catch (err) {
            throw new Error(err.message || 'Falha ao criar registro');
        }
    };

    return (
        <div className="psihome">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">Relatórios</p>
                    <h1>Relatórios e Evolução</h1>
                    <p className="agenda-page__subtitle">Consulte a linha do tempo clínica e registre a evolução dos seus pacientes com vínculo aceito.</p>
                </div>
            </header>

            {error && <div className="inline-alert inline-alert--error">{error}</div>}

            <section className="panel">
                <div className="panel__header">
                    <h2>Linha do tempo de Evolução</h2>
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

                {selectedPatient && (
                    <button
                        className="primary-button"
                        style={{ marginBottom: '20px' }}
                        onClick={() => setEvolutionModalOpen(true)}
                    >
                        <Plus size={16} style={{ marginRight: '6px' }} />
                        Novo Registro de Evolução
                    </button>
                )}

                {loadingTimeline ? (
                    <p className="state-row"><Loader2 className="spin" size={16} /> Carregando evolução…</p>
                ) : timeline.length === 0 ? (
                    <div className="empty-state-container">
                        <p className="empty-state">Nenhum registro de evolução para este paciente.</p>
                        <p style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>
                            Crie um novo registro clicando no botão acima ou adicione anotações aos registros emocionais do paciente.
                        </p>
                    </div>
                ) : (
                    <div className="simple-list" style={{ marginTop: '12px' }}>
                        {timeline.map((item) => (
                            <div className="simple-list__item" key={item.prontuarioId || item.id}>
                                <div>
                                    <strong>{formatDateTime(item.inicioEm)}</strong>
                                    {item.temasSessao && item.temasSessao.length > 0 ? (
                                        <span>{item.temasSessao.join(', ')}</span>
                                    ) : (
                                        <span style={{ color: '#999' }}>Sem temas registrados</span>
                                    )}
                                    {item.evolucaoClinica && (
                                        <p style={{ marginTop: '6px', fontSize: '13px', color: '#666' }}>
                                            {item.evolucaoClinica.substring(0, 100)}...
                                        </p>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>
                                        Progresso: {item.nivelProgresso != null ? `${item.nivelProgresso}/10` : 'NÃ£o informado'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Emotional records submitted by patient (psychologist view) */}
                <div style={{ marginTop: 32, paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
                    <h3 style={{ marginBottom: '16px' }}>📊 Registros Emocionais do Paciente</h3>
                    {loadingRecords && (
                        <p className="state-row"><Loader2 className="spin" size={16} /> Carregando…</p>
                    )}
                    {!loadingRecords && (records == null || records.length === 0) ? (
                        <p className="empty-state">Nenhum registro emocional disponível para este paciente.</p>
                    ) : (
                        <div className="simple-list" style={{ marginTop: '12px' }}>
                            {records.map((r) => (
                                <div className="simple-list__item" key={r.id}>
                                    <div>
                                        <strong>{formatDateTime(r.registradoEm)}</strong>
                                        <span>Humor: {r.humorDia}/5 {r.emocoes && r.emocoes.length > 0 ? `— ${r.emocoes.join(', ')}` : ''}</span>
                                        {r.descricao && (
                                            <p style={{ marginTop: '6px', fontSize: '13px', color: '#666' }}>
                                                {r.descricao}
                                            </p>
                                        )}
                                    </div>
                                    <div className="inline-actions">
                                        <button
                                            className="secondary-button"
                                            type="button"
                                            onClick={() => handleOpenAnnotationModal(r)}
                                        >
                                            ✏️ Anotar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Modals */}
            <RecordAnnotationModal
                isOpen={annotationModalOpen}
                onClose={() => setAnnotationModalOpen(false)}
                onSubmit={handleSubmitAnnotation}
                registroData={selectedRecord}
            />

            <EvolutionRecordModal
                isOpen={evolutionModalOpen}
                onClose={() => setEvolutionModalOpen(false)}
                onSubmit={handleSubmitEvolution}
                pacienteNome={selectedPatientName}
            />
        </div>
    );
}
