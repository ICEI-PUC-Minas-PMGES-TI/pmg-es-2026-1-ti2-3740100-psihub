import { useState } from 'react';
import { FileText, Loader2, Plus } from 'lucide-react';
import { formatDateTime } from '@/shared/utils/date.utils';
import { useReports } from '../hooks/useReports';
import { psychologistApi } from '@/services/psychologist.service';
import { RecordAnnotationModal } from './RecordAnnotationModal';
import { EvolutionRecordModal } from './EvolutionRecordModal';
import { ClinicalTimeline } from './ClinicalTimeline';

export function ReportsPage({ onToast, initialPatientId }) {
    const {
        patients,
        selectedPatient,
        setSelectedPatient,
        mergedTimeline,
        tendencia,
        loadingPatients,
        loadingTimeline,
        loadingRecords,
        error,
        refreshReports,
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
            await psychologistApi.createRecordAnnotation({
                pacienteId: selectedPatient,
                registroId: selectedRecord.id,
                texto: formData.observacao
            });
            onToast?.({ type: 'success', message: 'Anotação salva com sucesso!' });
            setAnnotationModalOpen(false);
            await refreshReports();
        } catch (err) {
            throw new Error(err.message || 'Falha ao criar anotação');
        }
    };

    // Handle evolution modal
    const handleSubmitEvolution = async (formData) => {
        try {
            const payload = {
                pacienteId: Number(selectedPatient),
                titulo: formData.titulo || 'Sem título',
                temasSessao: formData.temasSessao.split(',').map(t => t.trim()).filter(t => t),
                anotacoesClinicas: formData.observacaoClinica,
                nivelEngajamento: formData.nivelEngajamento,
                nivelProgresso: formData.nivelProgresso,
                intercorrencias: formData.intercorrencias || null,
                tarefasEncaminhamentos: formData.tarefas || null,
            };
            const createdEvolution = await psychologistApi.createEvolutionRecord(payload);
            onToast?.({ type: 'success', message: 'Registro de evolução criado com sucesso!' });
            setEvolutionModalOpen(false);
            await refreshReports(createdEvolution);
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
                    <h2>Linha do tempo clínica</h2>
                    <FileText size={20} />
                </div>

                <div className="mb-5 grid gap-4">
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
                            className="primary-button primary-button--fit"
                            type="button"
                            onClick={() => setEvolutionModalOpen(true)}
                        >
                            <Plus size={16} aria-hidden="true" />
                            Novo Registro de Evolução
                        </button>
                    )}
                </div>

                {(loadingTimeline || loadingRecords) && (
                    <p className="state-row"><Loader2 className="spin" size={16} /> Carregando linha do tempo clínica…</p>
                )}

                <ClinicalTimeline
                    events={mergedTimeline}
                    tendencia={tendencia}
                    loading={loadingTimeline || loadingRecords}
                    hasSelectedPatient={Boolean(selectedPatient)}
                    onAnnotateRecord={handleOpenAnnotationModal}
                />
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
