import { useCallback, useEffect, useState } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { financialApi } from '@/services/financial.service';
import { schedulingApi } from '@/services/scheduling.service';
import { formatDateTime } from '@/shared/utils/date.utils';
import { ModalRegistrarPagamento } from '../ModalRegistrarPagamento';

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

export function PsychologistFinancialPage({ onToast }) {
    const [pagamentos, setPagamentos] = useState([]);
    const [consultasSemPagamento, setConsultasSemPagamento] = useState([]);
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroInicio, setFiltroInicio] = useState('');
    const [filtroFim, setFiltroFim] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [modalAberto, setModalAberto] = useState(false);

    const carregarPagamentos = useCallback((signal) => {
        const query = {
            status: filtroStatus || undefined,
            inicio: filtroInicio || undefined,
            fim: filtroFim || undefined,
            signal,
        };
        return financialApi.listPsychologistPayments(query);
    }, [filtroStatus, filtroInicio, filtroFim]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);

        Promise.all([
            carregarPagamentos(controller.signal),
            schedulingApi.listConsultations({ status: 'CONCLUIDA', signal: controller.signal }),
        ])
            .then(([listaPagamentos, listaConsultas]) => {
                const lista = listaPagamentos || [];
                setPagamentos(lista);
                const idsPagos = new Set(lista.map((p) => p.consultaId));
                setConsultasSemPagamento((listaConsultas || []).filter((c) => !idsPagos.has(c.id)));
                setErro('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setErro(err.message || 'Não foi possível carregar os pagamentos.');
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [carregarPagamentos]);

    async function handleRegistrar(payload) {
        try {
            await financialApi.registerPayment(payload);
            onToast?.({ type: 'success', message: 'Pagamento registrado com sucesso.' });
            setModalAberto(false);
            // Reload
            const [listaPagamentos, listaConsultas] = await Promise.all([
                financialApi.listPsychologistPayments({ status: filtroStatus || undefined, inicio: filtroInicio || undefined, fim: filtroFim || undefined }),
                schedulingApi.listConsultations({ status: 'CONCLUIDA' }),
            ]);
            const lista = listaPagamentos || [];
            setPagamentos(lista);
            const idsPagos = new Set(lista.map((p) => p.consultaId));
            setConsultasSemPagamento((listaConsultas || []).filter((c) => !idsPagos.has(c.id)));
        } catch (err) {
            onToast?.({ type: 'error', message: err.message || 'Erro ao registrar pagamento.' });
        }
    }

    async function handleConfirmar(pagamentoId) {
        try {
            await financialApi.confirmPayment(pagamentoId, { statusPagamento: 'PAGO' });
            onToast?.({ type: 'success', message: 'Pagamento confirmado.' });
            setPagamentos((prev) =>
                prev.map((p) => (p.id === pagamentoId ? { ...p, statusPagamento: 'PAGO' } : p))
            );
        } catch (err) {
            onToast?.({ type: 'error', message: err.message || 'Erro ao confirmar pagamento.' });
        }
    }

    async function handleEstornar(pagamentoId) {
        if (!window.confirm('Confirmar estorno deste pagamento?')) return;
        try {
            await financialApi.refundPayment(pagamentoId);
            onToast?.({ type: 'success', message: 'Pagamento estornado.' });
            setPagamentos((prev) =>
                prev.map((p) => (p.id === pagamentoId ? { ...p, statusPagamento: 'ESTORNADO' } : p))
            );
        } catch (err) {
            onToast?.({ type: 'error', message: err.message || 'Erro ao estornar pagamento.' });
        }
    }

    async function handleVerRecibo(pagamentoId) {
        try {
            const recibo = await financialApi.getPsychologistReceipt(pagamentoId);
            onToast?.({ type: 'success', message: `Recibo: ${recibo.numeroRecibo}` });
        } catch (err) {
            onToast?.({ type: 'error', message: err.message || 'Erro ao buscar recibo.' });
        }
    }

    return (
        <div className="psihome">
            <header className="agenda-page__header panel">
                <div>
                    <p className="eyebrow">Financeiro</p>
                    <h1>Gestão Financeira</h1>
                    <p className="agenda-page__subtitle">Registre e acompanhe os pagamentos das consultas concluídas.</p>
                </div>
                <button
                    className="primary-button primary-button--fit"
                    type="button"
                    onClick={() => setModalAberto(true)}
                >
                    <DollarSign size={16} />
                    Registrar Pagamento
                </button>
            </header>

            {erro && <div className="inline-alert inline-alert--error">{erro}</div>}

            <section className="panel">
                <div className="panel__header">
                    <h2>Pagamentos</h2>
                </div>

                <div className="form-grid">
                    <label className="field">
                        Status
                        <select value={filtroStatus} onChange={(event) => setFiltroStatus(event.target.value)}>
                            <option value="">Todos</option>
                            <option value="PENDENTE">Pendente</option>
                            <option value="PAGO">Pago</option>
                            <option value="ESTORNADO">Estornado</option>
                            <option value="CANCELADO">Cancelado</option>
                        </select>
                    </label>
                    <label className="field">
                        Período início
                        <input
                            type="date"
                            value={filtroInicio}
                            onChange={(event) => setFiltroInicio(event.target.value)}
                        />
                    </label>
                    <label className="field">
                        Período fim
                        <input
                            type="date"
                            value={filtroFim}
                            onChange={(event) => setFiltroFim(event.target.value)}
                        />
                    </label>
                </div>

                {loading ? (
                    <p className="state-row"><Loader2 className="spin" size={16} /> Carregando pagamentos…</p>
                ) : pagamentos.length === 0 ? (
                    <p className="empty-state">Nenhum pagamento registrado ainda.</p>
                ) : (
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase">
                                    <th className="py-2 pr-4 font-medium">Paciente</th>
                                    <th className="py-2 pr-4 font-medium">Data da Consulta</th>
                                    <th className="py-2 pr-4 font-medium">Valor</th>
                                    <th className="py-2 pr-4 font-medium">Forma</th>
                                    <th className="py-2 pr-4 font-medium">Status</th>
                                    <th className="py-2 font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagamentos.map((pagamento) => {
                                    const consulta = consultasSemPagamento.find((c) => c.id === pagamento.consultaId);
                                    return (
                                        <tr key={pagamento.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 pr-4">
                                                {consulta?.pacienteNome ?? `Consulta #${pagamento.consultaId}`}
                                            </td>
                                            <td className="py-3 pr-4 whitespace-nowrap">
                                                {consulta ? formatDateTime(consulta.inicioEm) : '—'}
                                            </td>
                                            <td className="py-3 pr-4 whitespace-nowrap">
                                                {pagamento.valor != null
                                                    ? `R$ ${Number(pagamento.valor).toFixed(2).replace('.', ',')}`
                                                    : '—'}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {FORMA_LABELS[pagamento.formaPagamento] ?? pagamento.formaPagamento}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[pagamento.statusPagamento] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {STATUS_LABELS[pagamento.statusPagamento] ?? pagamento.statusPagamento}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <div className="row-actions">
                                                    {pagamento.statusPagamento === 'PENDENTE' && (
                                                        <button
                                                            className="primary-button primary-button--fit"
                                                            type="button"
                                                            onClick={() => handleConfirmar(pagamento.id)}
                                                        >
                                                            Confirmar
                                                        </button>
                                                    )}
                                                    {pagamento.statusPagamento === 'PAGO' && (
                                                        <>
                                                            <button
                                                                className="secondary-button"
                                                                type="button"
                                                                onClick={() => handleVerRecibo(pagamento.id)}
                                                            >
                                                                Ver Recibo
                                                            </button>
                                                            <button
                                                                className="danger-button"
                                                                type="button"
                                                                onClick={() => handleEstornar(pagamento.id)}
                                                            >
                                                                Estornar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {modalAberto && (
                <ModalRegistrarPagamento
                    consultas={consultasSemPagamento}
                    onConfirm={handleRegistrar}
                    onClose={() => setModalAberto(false)}
                />
            )}
        </div>
    );
}
