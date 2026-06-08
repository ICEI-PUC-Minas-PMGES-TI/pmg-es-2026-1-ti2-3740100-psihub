/**
 * @module pacientes
 * @description Modulo responsavel pela experiencia do paciente autenticado: agenda, consultas, perfil e registros emocionais.
 *
 * Componentes publicos: PatientDashboard, PatientEmotionPage, PatientPaymentsPage, PatientProfilePage.
 * Hooks publicos: usePatientAgendamento, usePatientCancelamento, usePatientDashboardData, usePatientEmotion, usePatientProfile.
 * Utils publicos: patient.utils.js.
 *
 * @example
 * import { PatientDashboard, PatientProfilePage } from '@/modules/pacientes';
 *
 * @see services/scheduling.service.js para agenda, consultas e cancelamentos.
 * @see services/patient.service.js para perfil, psicologos disponiveis e registros emocionais.
 * @see shared/utils/date.utils.js para formatacao e calculos de datas.
 */
export { PatientDashboard } from './components/PatientDashboard';
export { PatientEmotionPage } from './components/PatientEmotionPage';
export { PatientProfilePage } from './components/PatientProfilePage';
export { PatientPaymentsPage } from './components/PatientPaymentsPage';
export { AvaliacaoConsultaModal } from './components/AvaliacaoConsultaModal';
export { usePatientAgendamento } from './hooks/usePatientAgendamento';
export { usePatientCancelamento } from './hooks/usePatientCancelamento';
export { usePatientDashboardData } from './hooks/usePatientDashboardData';
export { usePatientEmotion } from './hooks/usePatientEmotion';
export { usePatientProfile } from './hooks/usePatientProfile';
