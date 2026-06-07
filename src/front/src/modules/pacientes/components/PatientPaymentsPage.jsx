import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { financialApi } from '@/services/financial.service';
import { formatDateTime } from '@/shared/utils/date.utils';

const STATUS_LABELS = {
    PENDENTE: 'Pendente',
    PAGO: 'Pago',
    ESTORNADO: 'Estornado',
    CANCELADO: 'Cancelado',
};

const STATUS_BADGE_CLASS = {
    PENDENTE: 'bg-yellow-100 text-yellow-800',
    PAGO: 'bg-green-100 text-green-800',
    ESTORNADO: 'bg-red-100 text-red-800',
    CANCELADO: 'bg-gray-100 text-gray-600',
};

const FORMA_LABELS = {
    PIX: 'PIX',
    CARTAO: 'Cartão',
    DINHEIRO: 'Dinheiro',
};

export function PatientPaymentsPage({ onToast }) {
    const [pagamentos, setPagamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        financialApi
            .listMyPayments({ signal: controller.signal })
            .then((data) => {
                setPagamentos(data || []);
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(
                        err.message ||
                            'Não foi possível carregar os pagamentos.'
                    );
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, []);

    async function handleBaixarRecibo(pagamentoId) {
        try {
            const recibo = await financialApi.getMyReceipt(pagamentoId);

            if (
                !recibo?.arquivoUrl ||
                recibo.arquivoUrl === 'pending'
            ) {
                onToast?.({
                    type: 'error',
                    message:
                        'Recibo ainda não disponível para download.',
                });
                return;
            }

            window.open(recibo.arquivoUrl, '_blank');
        } catch (err) {
            onToast?.({
                type: 'error',
                message:
                    err.message || 'Erro ao buscar recibo.',
            });
        }
    }

    const pagamentosPendentes = pagamentos.filter(
        (pagamento) => pagamento.statusPagamento === 'PENDENTE'
    );

    const historicoPagamentos = pagamentos.filter(
        (pagamento) => pagamento.statusPagamento !== 'PENDENTE'
    );

    const renderTabela = (lista, mostrarRecibo = false) => (
        <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase">
                        <th className="py-2 pr-4 font-medium">
                            Data da Consulta
                        </th>
                        <th className="py-2 pr-4 font-medium">
                            Psicólogo
                        </th>
                        <th className="py-2 pr-4 font-medium">
                            Valor
                        </th>
                        <th className="py-2 pr-4 font-medium">
                            Forma
                        </th>
                        <th className="py-2 pr-4 font-medium">
                            Status
                        </th>

                        {mostrarRecibo && (
                            <th className="py-2 font-medium">
                                Ação
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {lista.map((pagamento) => (
                        <tr
                            key={pagamento.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                        >
                            <td className="py-3 pr-4 whitespace-nowrap">
                                {pagamento.inicioEm
                                    ? formatDateTime(
                                          pagamento.inicioEm
                                      )
                                    : `Consulta #${pagamento.consultaId}`}
                            </td>

                            <td className="py-3 pr-4">
                                {pagamento.psicologoNome ?? '—'}
                            </td>

                            <td className="py-3 pr-4 whitespace-nowrap">
                                {pagamento.valor != null
                                    ? `R$ ${Number(
                                          pagamento.valor
                                      )
                                          .toFixed(2)
                                          .replace('.', ',')}`
                                    : '—'}
                            </td>

                            <td className="py-3 pr-4">
                                {FORMA_LABELS[
                                    pagamento.formaPagamento
                                ] ??
                                    pagamento.formaPagamento ??
                                    '—'}
                            </td>

                            <td className="py-3 pr-4">
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        STATUS_BADGE_CLASS[
                                            pagamento
                                                .statusPagamento
                                        ] ??
                                        'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    {STATUS_LABELS[
                                        pagamento.statusPagamento
                                    ] ??
                                        pagamento.statusPagamento}
                                </span>
                            </td>

                            {mostrarRecibo && (
                                <td className="py-3">
                                    {pagamento.statusPagamento ===
                                        'PAGO' && (
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() =>
                                                handleBaixarRecibo(
                                                    pagamento.id
                                                )
                                            }
                                        >
                                            Baixar Recibo
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="psihome">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">Financeiro</p>
                    {/* <h1>Meus Pagamentos</h1> */}
                    <p className="agenda-page__subtitle">
                    Consulte seus pagamentos pendentes
                    e o histórico financeiro.
                    </p>
                </div>
            </header>

            {error && (
                <div className="inline-alert inline-alert--error">
                    {error}
                </div>
            )}

            {loading ? (
                <section className="panel">
                    <p className="state-row">
                        <Loader2
                            className="spin"
                            size={16}
                        />
                        Carregando pagamentos...
                    </p>
                </section>
            ) : (
                <>
                    <section className="panel">
                        <div className="panel__header">
                            <h2>
                                Pagamentos Pendentes
                            </h2>
                        </div>

                        {pagamentosPendentes.length ===
                        0 ? (
                            <p className="empty-state">
                                Você não possui
                                pagamentos pendentes.
                            </p>
                        ) : (
                            renderTabela(
                                pagamentosPendentes
                            )
                        )}
                    </section>

                    <section className="panel">
                        <div className="panel__header">
                            <h2>
                                Histórico de Pagamentos
                            </h2>
                        </div>

                        {historicoPagamentos.length ===
                        0 ? (
                            <p className="empty-state">
                                Nenhum pagamento
                                realizado ainda.
                            </p>
                        ) : (
                            renderTabela(
                                historicoPagamentos,
                                true
                            )
                        )}
                    </section>
                </>
            )}
        </div>
    );
}