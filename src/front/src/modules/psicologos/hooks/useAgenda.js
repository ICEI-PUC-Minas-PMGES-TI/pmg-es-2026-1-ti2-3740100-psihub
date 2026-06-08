import { useState } from 'react';
import { useAgendaCalendar } from './useAgendaCalendar';
import { useAgendaExport } from './useAgendaExport';
import { useAgendaFiltros } from './useAgendaFiltros';
import { useAgendaUiState } from './useAgendaUiState';
import { useAgendaAgendarConsultaMutation } from './useAgendaAgendarConsultaMutation';
import { useAgendaConsultaActionsMutation } from './useAgendaConsultaActionsMutation';
import { useAgendaCancelarConsultaMutation } from './useAgendaCancelarConsultaMutation';
import { useAgendaConsultasQuery } from './useAgendaConsultasQuery';
import { useAgendaDisponibilidadeMutation } from './useAgendaDisponibilidadeMutation';
import { useAgendaDisponibilidadeQuery } from './useAgendaDisponibilidadeQuery';
import { useAgendaHorariosAvulsosQuery } from './useAgendaHorariosAvulsosQuery';

/**
 * @deprecated Facade de compatibilidade da agenda do psicologo.
 * Prefira usar hooks especializados `useAgenda*` para novas evolucoes.
 *
 * @param {{ onToast?: Function }} params
 * @returns {Object} estado, dados derivados e callbacks necessarios pela tela atual de agenda.
 */
export function useAgenda({ onToast }) {
    const [refreshKey, setRefreshKey] = useState(0);
    const refreshAll = () => setRefreshKey((current) => current + 1);
    const ui = useAgendaUiState();
    const disponibilidade = useAgendaDisponibilidadeQuery({ onToast, refreshKey });
    const horarios = useAgendaHorariosAvulsosQuery({ onToast, refreshKey });
    const consultas = useAgendaConsultasQuery({ onToast, refreshKey });
    const filtros = useAgendaFiltros(consultas.consultations);
    const calendar = useAgendaCalendar({ ...disponibilidade, ...horarios, ...consultas, weekStart: ui.weekStart });
    const disponibilidadeMutation = useAgendaDisponibilidadeMutation({ ...ui, ...disponibilidade, onToast, refreshAll });
    const agendar = useAgendaAgendarConsultaMutation({ ...ui, ...calendar, onToast, refreshAll });
    const cancelar = useAgendaCancelarConsultaMutation({ ...ui, onToast, refreshAll });
    const consultaActions = useAgendaConsultaActionsMutation({ ...ui, onToast, refreshAll });
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
        ...consultaActions,
        ...exportacao,
    };
}
