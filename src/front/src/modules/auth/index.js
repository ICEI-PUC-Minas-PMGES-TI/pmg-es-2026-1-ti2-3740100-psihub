/**
 * @module auth
 * @description Modulo responsavel por entrada publica, login, cadastro, sessao autenticada e utilitarios de JWT/localStorage.
 *
 * Componentes publicos: AuthPage, LandingPage, PsychologistRegisterPage.
 * Hooks publicos: useAuthForm.
 * Utils publicos: storeAuthSession, clearAuthSession, getStoredAuthSession, decodeJwtPayload, getMenuItems.
 *
 * @example
 * import { AuthPage, getStoredAuthSession } from '@/modules/auth';
 *
 * @see services/auth.service.js para chamadas HTTP de login e cadastro.
 * @see modules/auth/utils/auth.utils.js para persistencia e leitura da sessao autenticada.
 */
export { AuthPage } from './components/AuthPage';
export { LandingPage } from './components/LandingPage';
export { PsychologistRegisterPage } from './components/PsychologistRegisterPage';
export { useAuthForm } from './hooks/useAuthForm';
export {
  clearAuthSession,
  decodeJwtPayload,
  getStoredAuthSession,
  storeAuthSession,
} from './utils/auth.utils';
export { getMenuItems } from './utils/menu.config';
