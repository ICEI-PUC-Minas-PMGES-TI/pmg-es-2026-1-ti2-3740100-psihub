/**
 * @module admin
 * @description Modulo responsavel pelas operacoes administrativas do PsiHub no frontend.
 *
 * Componentes publicos: AdminPsychologistsPage.
 * Hooks publicos: useAdminPsychologists.
 * Utils publicos: nenhum nesta versao.
 *
 * @example
 * import { AdminPsychologistsPage } from '@/modules/admin';
 *
 * @see services/admin.service.js para chamadas HTTP de aprovacao e revogacao de acesso.
 */
export { AdminPsychologistsPage } from './components/AdminPsychologistsPage';
export { useAdminPsychologists } from './hooks/useAdminPsychologists';
