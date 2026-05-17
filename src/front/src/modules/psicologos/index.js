/**
 * @module psicologos
 * @description Modulo responsavel pela experiencia do psicologo autenticado: agenda, disponibilidade, pacientes, perfil e relatorios.
 *
 * Componentes publicos: PsychologistAgendaPage, PsychologistDashboard, PatientsManagementPage, PsychologistProfilePage, ReportsPage.
 * Hooks publicos: useAgenda.
 * Utils publicos: nenhum nesta versao.
 *
 * @example
 * import { PsychologistAgendaPage, useAgenda } from '@/modules/psicologos';
 *
 * @see services/scheduling.service.js para agenda, disponibilidade, pacientes e consultas.
 * @see services/clinical.service.js para perfil, vinculos e linha do tempo clinica.
 * @see shared/utils/date.utils.js para formatacao e calculos de datas.
 */
export { PsychologistAgendaPage } from './components/PsychologistAgendaPage';
export { PsychologistDashboard } from './components/PsychologistDashboard';
export { PatientsManagementPage } from './components/PatientsManagementPage';
export { PsychologistProfilePage } from './components/PsychologistProfilePage';
export { ReportsPage } from './components/ReportsPage';
export { useAgenda } from './hooks/useAgenda';
