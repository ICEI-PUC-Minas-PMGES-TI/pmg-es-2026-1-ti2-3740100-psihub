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
                <table className="data-table data-table--native">
                    <caption className="sr-only">Psicologos disponiveis para agendamento</caption> {/* Usa tabela nativa para leitores de tela anunciarem cabecalhos e linhas corretamente. */}
                    <thead>
                        <tr className="data-table__row data-table__row--head">
                            <th scope="col">Nome</th>
                            <th scope="col">Especialidade</th>
                            <th scope="col">Avaliacao</th>
                            <th scope="col">Acoes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {psychologists.map((psychologist) => (
                            <tr className="data-table__row" key={psychologist.id}>
                                <td>{psychologist.nome}</td>
                                <td>{psychologist.especialidades?.[0] || 'Psicologia'}</td>
                                <td>Ainda sem avaliacao</td>
                                <td>
                                    <button className="secondary-button" type="button" onClick={() => onOpenAgenda(psychologist)}>
                                        Ver agenda
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
