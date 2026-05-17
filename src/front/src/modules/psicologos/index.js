/**
 * @module psicologos
 * @description Modulo responsavel pela experiencia do psicologo autenticado.
 *
 * Componentes publicos: PsychologistAgendaPage, PsychologistDashboard.
 * Hooks publicos: useAgenda.
 * Utils publicos: nenhum nesta versao.
 *
 * @example
 * import { PsychologistAgendaPage, PsychologistDashboard, useAgenda } from '@/modules/psicologos';
 *
 * @see services/scheduling.service.js para chamadas HTTP de agenda, disponibilidade e consultas.
 * @see shared/utils/date.utils.js para formatacao e calculos de datas.
 */
export { PsychologistAgendaPage } from './components/PsychologistAgendaPage';
export { PsychologistDashboard } from './components/PsychologistDashboard';
export { useAgenda } from './hooks/useAgenda';
