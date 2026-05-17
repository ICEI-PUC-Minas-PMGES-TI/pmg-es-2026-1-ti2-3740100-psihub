import { useState } from 'react';
import { useAgendaCalendar } from './agenda/useAgendaCalendar';
import { useAgendaExport } from './agenda/useAgendaExport';
import { useAgendaFiltros } from './agenda/useAgendaFiltros';
import { useAgendaUiState } from './agenda/useAgendaUiState';
import { useAgendarConsultaMutation } from './agenda/useAgendarConsultaMutation';
import { useCancelarConsultaMutation } from './agenda/useCancelarConsultaMutation';
import { useConsultasQuery } from './agenda/useConsultasQuery';
import { useDisponibilidadeMutation } from './agenda/useDisponibilidadeMutation';
import { useDisponibilidadeQuery } from './agenda/useDisponibilidadeQuery';
import { useHorariosAvulsosQuery } from './agenda/useHorariosAvulsosQuery';

/**
 * @deprecated Facade de compatibilidade da agenda do psicologo.
 * Prefira usar hooks especializados em `hooks/agenda/` para novas evolucoes.
 *
 * @param {{ onToast?: Function }} params
 * @returns {Object} estado, dados derivados e callbacks necessarios pela tela atual de agenda.
 */
export function useAgenda({ onToast }) {
    const [refreshKey, setRefreshKey] = useState(0);
    const refreshAll = () => setRefreshKey((current) => current + 1);
    const ui = useAgendaUiState();
    const disponibilidade = useDisponibilidadeQuery({ onToast, refreshKey });
    const horarios = useHorariosAvulsosQuery({ onToast, refreshKey });
    const consultas = useConsultasQuery({ onToast, refreshKey });
    const filtros = useAgendaFiltros(consultas.consultations);
    const calendar = useAgendaCalendar({ ...disponibilidade, ...horarios, ...consultas, weekStart: ui.weekStart });
    const disponibilidadeMutation = useDisponibilidadeMutation({ ...ui, ...disponibilidade, onToast, refreshAll });
    const agendar = useAgendarConsultaMutation({ ...ui, ...calendar, onToast, refreshAll });
    const cancelar = useCancelarConsultaMutation({ ...ui, onToast, refreshAll });
    const exportacao = useAgendaExport({ filteredConsultations: filtros.filteredConsultations, onToast });

    return {
        ...ui,
        ...disponibilidade,
        ...horarios,
        ...consultas,
        ...filtros,
        ...calendar,
        ...disponibilidadeMutation,
        ...agendar,
        ...cancelar,
        ...exportacao,
    };
}
