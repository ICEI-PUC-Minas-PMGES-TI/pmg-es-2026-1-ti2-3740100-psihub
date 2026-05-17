/**
 * @module pacientes
 * @description Modulo responsavel pela experiencia do paciente autenticado: agenda, consultas, perfil e registros emocionais.
 *
 * Componentes publicos: PatientDashboard, PatientEmotionPage, PatientProfilePage.
 * Hooks publicos: nenhum nesta versao.
 * Utils publicos: nenhum nesta versao.
 *
 * @example
 * import { PatientDashboard, PatientProfilePage } from '@/modules/pacientes';
 *
 * @see services/scheduling.service.js para agenda, consultas e cancelamentos.
 * @see services/clinical.service.js para perfil e registros emocionais.
 * @see shared/utils/date.utils.js para formatacao e calculos de datas.
 */
export { PatientDashboard } from './components/PatientDashboard';
export { PatientEmotionPage } from './components/PatientEmotionPage';
export { PatientProfilePage } from './components/PatientProfilePage';
