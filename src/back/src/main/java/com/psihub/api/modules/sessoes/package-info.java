/**
 * Modulo de sessoes terapeuticas.
 *
 * <p>Responsabilidades:
 * - Preparar sessoes a partir de consultas;
 * - Iniciar, salvar rascunhos e encerrar sessoes;
 * - Gerenciar prontuarios e linha do tempo clinica.
 *
 * <p>Dependencias permitidas:
 * - shared/config, shared/dto, shared/enums, shared/exception e shared/utils;
 * - services de outros modulos quando houver comunicacao entre dominios.
 *
 * <p>Dependencias proibidas:
 * - Qualquer repository de outro modulo.
 *
 * <p>Ponto de entrada externo: SessaoService.
 */
package com.psihub.api.modules.sessoes;
