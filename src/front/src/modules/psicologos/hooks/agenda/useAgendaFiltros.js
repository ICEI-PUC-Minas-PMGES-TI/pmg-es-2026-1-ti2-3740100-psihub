import { useEffect, useMemo, useState } from 'react';
import { toIsoDate } from '@/shared/utils/date.utils';
import { ACTIVE_STATUSES, CONSULTATION_PAGE_SIZE } from './agenda.constants';
import { normalizeText } from './agenda.utils';

/**
 * Controla filtros, paginacao e ordenacao da lista de consultas.
 *
 * @param {Array} consultations
 * @returns {{ statusFilter: string, setStatusFilter: Function, typeFilter: string, setTypeFilter: Function, searchQuery: string, setSearchQuery: Function, dateFilter: string, setDateFilter: Function, consultationPage: number, setConsultationPage: Function, showHistory: boolean, setShowHistory: Function, showMoreFilters: boolean, setShowMoreFilters: Function, filteredConsultations: Array, rowsWithSeparators: Array, consultationPages: number }}
 */
export function useAgendaFiltros(consultations) {
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [consultationPage, setConsultationPage] = useState(1);
    const [showHistory, setShowHistory] = useState(false);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const filteredConsultations = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return consultations
            .filter((consultation) => {
                if (!showHistory && !ACTIVE_STATUSES.has(consultation.status)) return false;
                if (statusFilter !== 'ALL' && consultation.status !== statusFilter) return false;
                if (typeFilter !== 'ALL' && consultation.tipoAtendimento !== typeFilter) return false;
                if (dateFilter && consultation.inicioEm.slice(0, 10) !== dateFilter) return false;
                if (!normalizedQuery) return true;
                return normalizeText(consultation.pacienteNome).includes(normalizedQuery);
            })
            .sort((first, second) => {
                const diff = new Date(first.inicioEm) - new Date(second.inicioEm);
                return showHistory ? -diff : diff;
            });
    }, [consultations, searchQuery, statusFilter, typeFilter, dateFilter, showHistory]);

    const pagedConsultations = useMemo(() => {
        const startIndex = (consultationPage - 1) * CONSULTATION_PAGE_SIZE;
        return filteredConsultations.slice(startIndex, startIndex + CONSULTATION_PAGE_SIZE);
    }, [consultationPage, filteredConsultations]);

    const rowsWithSeparators = useMemo(() => {
        if (showHistory) return pagedConsultations.map((c) => ({ type: 'consultation', data: c }));
        const todayKey = toIsoDate(new Date());
        const items = [];
        let todayInserted = false;
        for (const consultation of pagedConsultations) {
            const dateKey = consultation.inicioEm.slice(0, 10);
            if (!todayInserted && dateKey === todayKey) {
                items.push({ type: 'separator', label: 'Hoje' });
                todayInserted = true;
            }
            items.push({ type: 'consultation', data: consultation });
        }
        return items;
    }, [pagedConsultations, showHistory]);

    const consultationPages = Math.max(1, Math.ceil(filteredConsultations.length / CONSULTATION_PAGE_SIZE));

    useEffect(() => {
        setConsultationPage(1);
    }, [searchQuery, statusFilter, typeFilter, dateFilter, showHistory]);

    return {
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        searchQuery,
        setSearchQuery,
        dateFilter,
        setDateFilter,
        consultationPage,
        setConsultationPage,
        showHistory,
        setShowHistory,
        showMoreFilters,
        setShowMoreFilters,
        filteredConsultations,
        rowsWithSeparators,
        consultationPages,
    };
}
