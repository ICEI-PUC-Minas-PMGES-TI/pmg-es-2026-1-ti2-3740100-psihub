import { SearchX } from 'lucide-react';
import { EmptyState, LoadingState } from '../PatientStates';

export function SearchPsychologistView({ psychologists, loading, onOpenAgenda }) {
    return (
        <section className="panel">
            <div className="panel__header">
                <div>
                    <p className="eyebrow">Agendamento</p>
                    <h2>Buscar psicologo</h2>
                </div>
            </div>

            {loading && <LoadingState />}

            {!loading && psychologists.length === 0 && (
                <EmptyState icon={SearchX} title="Nenhum psicologo disponivel no momento." />
            )}

            {!loading && psychologists.length > 0 && (
                <div className="data-table" role="table">
                    <div className="data-table__row data-table__row--head" role="row">
                        <span>Nome</span>
                        <span>Especialidade</span>
                        <span>Avaliacao</span>
                        <span />
                    </div>
                    {psychologists.map((psychologist) => (
                        <div className="data-table__row" role="row" key={psychologist.id}>
                            <span>{psychologist.nome}</span>
                            <span>{psychologist.especialidades?.[0] || 'Psicologia'}</span>
                            <span>Ainda sem avaliacao</span>
                            <button className="secondary-button" type="button" onClick={() => onOpenAgenda(psychologist)}>
                                Ver agenda
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
