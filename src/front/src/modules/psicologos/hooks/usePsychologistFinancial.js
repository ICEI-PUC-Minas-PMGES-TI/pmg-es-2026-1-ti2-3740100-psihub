import { useCallback, useEffect, useState } from 'react';
import { financialApi } from '@/services/financial.service';
import { schedulingApi } from '@/services/scheduling.service';

export function usePsychologistFinancial(onToast) {
    const [pagamentos, setPagamentos] = useState([]);
    const [consultasSemPagamento, setConsultasSemPagamento] = useState([]);
    const [resumo, setResumo] = useState(null);
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
            financialApi.getFinancialSummary({ inicio: filtroInicio || undefined, fim: filtroFim || undefined, signal: controller.signal }),
        ])
            .then(([listaPagamentos, listaConsultas, resumoData]) => {
                const lista = listaPagamentos || [];
                setPagamentos(lista);
                const idsPagos = new Set(lista.map((p) => p.consultaId));
                setConsultasSemPagamento((listaConsultas || []).filter((c) => !idsPagos.has(c.id)));
                setResumo(resumoData || null);
                setErro('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setErro(err.message || 'NÃ£o foi possÃ­vel carregar os pagamentos.');
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [carregarPagamentos, filtroInicio, filtroFim]);

    async function handleRegistrar(payload) {
        try {
            await financialApi.registerPayment(payload);
            onToast?.({ type: 'success', message: 'Pagamento registrado com sucesso.' });
            setModalAberto(false);
            // Reload
            const [listaPagamentos, listaConsultas, resumoData] = await Promise.all([
                financialApi.listPsychologistPayments({ status: filtroStatus || undefined, inicio: filtroInicio || undefined, fim: filtroFim || undefined }),
                schedulingApi.listConsultations({ status: 'CONCLUIDA' }),
                financialApi.getFinancialSummary({ inicio: filtroInicio || undefined, fim: filtroFim || undefined }),
            ]);
            const lista = listaPagamentos || [];
            setPagamentos(lista);
            const idsPagos = new Set(lista.map((p) => p.consultaId));
            setConsultasSemPagamento((listaConsultas || []).filter((c) => !idsPagos.has(c.id)));
            setResumo(resumoData || null);
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
            if (!recibo?.arquivoUrl || recibo.arquivoUrl === 'pending') {
                onToast?.({ type: 'error', message: 'Recibo ainda nÃ£o disponÃ­vel para download.' });
                return;
            }
            window.open(recibo.arquivoUrl, '_blank');
        } catch (err) {
            onToast?.({ type: 'error', message: err.message || 'Erro ao buscar recibo.' });
        }
    }

    return {
        pagamentos,
        consultasSemPagamento,
        resumo,
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
    };
}
