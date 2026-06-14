import { DollarSign, Loader2, Percent } from 'lucide-react';
import { currencyFormatter, formatDateTime } from '@/shared/utils/date.utils';
import { usePsychologistFinancial } from '../hooks/usePsychologistFinancial';
import { ModalRegistrarPagamento } from './ModalRegistrarPagamento';

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
    const {
        pagamentos,
        consultasSemPagamento,
        resumo,
        indicadorPagamentos,
        filtroStatus,
        setFiltroStatus,
        filtroInicio,
        setFiltroInicio,
        filtroFim,
        setFiltroFim,
        loading,
        erro,
        modalAberto,
        setModalAberto,
        handleRegistrar,
        handleConfirmar,
        handleEstornar,
        handleVerRecibo,
    } = usePsychologistFinancial(onToast);

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

            {resumo && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 8 }}>
                    <div className="panel" style={{ textAlign: 'center', padding: '16px 12px' }}>
                        <p className="eyebrow">Total Recebido</p>
                        <strong style={{ fontSize: 20, color: '#16a34a' }}>{currencyFormatter.format(resumo.totalPago ?? 0)}</strong>
                    </div>
                    <div className="panel" style={{ textAlign: 'center', padding: '16px 12px' }}>
                        <p className="eyebrow">Pendentes</p>
                        <strong style={{ fontSize: 20, color: '#ca8a04' }}>{currencyFormatter.format(resumo.totalPendente ?? 0)}</strong>
                    </div>
                    <div className="panel" style={{ textAlign: 'center', padding: '16px 12px' }}>
                        <p className="eyebrow">Estornados</p>
                        <strong style={{ fontSize: 20, color: '#dc2626' }}>{currencyFormatter.format(resumo.totalEstornado ?? 0)}</strong>
                    </div>
                    <div className="panel" style={{ textAlign: 'center', padding: '16px 12px' }}>
                        <p className="eyebrow">Pagamentos efetuados</p>
                        <strong style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 20, color: '#2563eb' }}>
                            <Percent size={18} />
                            {formatPercent(indicadorPagamentos?.percentual)}
                        </strong>
                        <small style={{ display: 'block', marginTop: 4, color: 'var(--color-text-secondary)' }}>
                            {indicadorPagamentos
                                ? `${indicadorPagamentos.pagamentosEfetuados}/${indicadorPagamentos.totalPagamentos} pagos`
                                : 'Sem dados no período'}
                        </small>
                    </div>
                </div>
            )}

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
                                    return (
                                        <tr key={pagamento.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 pr-4">
                                                {pagamento.pacienteNome ?? `Consulta #${pagamento.consultaId}`}
                                            </td>
                                            <td className="py-3 pr-4 whitespace-nowrap">
                                                {pagamento.inicioEm ? formatDateTime(pagamento.inicioEm) : '—'}
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

function formatPercent(value) {
    if (value == null || Number.isNaN(Number(value))) {
        return '--';
    }

    return `${Number(value).toFixed(1).replace('.', ',')}%`;
}
