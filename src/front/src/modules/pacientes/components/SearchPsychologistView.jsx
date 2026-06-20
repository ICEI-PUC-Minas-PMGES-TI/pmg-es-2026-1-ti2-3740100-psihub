import { SearchX } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';

export function SearchPsychologistView({ psychologists, loading, onOpenAgenda }) {
    return (
        <div className="psihome">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">Agendamento</p>
                    <p className="agenda-page__subtitle">Encontre um psicólogo disponível e escolha um horário.</p>
                </div>
            </header>
            <section className="panel">
                <div className="panel__header">
                    <h2>Psicólogos disponíveis</h2>
                </div>

                {loading && <LoadingState />}

                {!loading && psychologists.length === 0 && (
                    <EmptyState icon={SearchX} title="Nenhum psicólogo disponível no momento." />
                )}

                {!loading && psychologists.length > 0 && (
                    <table className="data-table data-table--native">
                        <caption className="sr-only">Psicólogos disponíveis para agendamento</caption> {/* Usa tabela nativa para leitores de tela anunciarem cabecalhos e linhas corretamente. */}
                        <thead>
                            <tr className="data-table__row data-table__row--head">
                                <th scope="col">Nome</th>
                                <th scope="col">Especialidade</th>
                                <th scope="col">Avaliação</th>
                                <th scope="col">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {psychologists.map((psychologist) => (
                                <tr className="data-table__row" key={psychologist.id}>
                                    <td>{psychologist.nome}</td>
                                    <td>{psychologist.especialidades?.[0] || 'Psicologia'}</td>
                                    <td>Ainda sem avaliação</td>
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
        </div>
    );
}
