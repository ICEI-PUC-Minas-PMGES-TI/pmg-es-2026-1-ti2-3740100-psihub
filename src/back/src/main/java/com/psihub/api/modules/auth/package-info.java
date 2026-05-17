/**
 * Modulo de autenticacao e usuarios da plataforma.
 *
 * <p>Responsabilidades:
 * - Registrar usuarios;
 * - Autenticar credenciais;
 * - Emitir, validar e interpretar tokens JWT.
 *
 * <p>Dependencias permitidas:
 * - shared/config, shared/dto, shared/enums, shared/exception e shared/middleware;
 * - services de outros modulos quando houver comunicacao entre dominios.
 *
 * <p>Dependencias proibidas:
 * - Qualquer repository de outro modulo.
 *
 * <p>Ponto de entrada externo: AuthService e JwtService.
 */
package com.psihub.api.modules.auth;
