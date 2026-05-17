/**
 * @module auth
 * @description Modulo responsavel por entrada publica, login, cadastro e sessao autenticada.
 *
 * Componentes publicos: AuthPage, LandingPage.
 * Hooks publicos: useAuthForm, useAuthSession.
 * Utils publicos: storeAuthSession, clearAuthSession, getStoredAuthSession, decodeJwtPayload.
 *
 * @example
 * import { AuthPage, getStoredAuthSession } from '@/modules/auth';
 *
 * @see services/auth.service.js para chamadas HTTP de login e cadastro.
 * @see modules/auth/utils/auth.utils.js para persistencia e leitura do JWT.
 */
export { AuthPage } from './components/AuthPage';
export { LandingPage } from './components/LandingPage';
export { useAuthForm } from './hooks/useAuthForm';
export { useAuthSession } from './hooks/useAuthSession';
export {
  clearAuthSession,
  decodeJwtPayload,
  getStoredAuthSession,
  storeAuthSession,
} from './utils/auth.utils';
