/**
 * Modulo de gerenciamento de agenda de psicologos.
 *
 * <p>Responsabilidades:
 * - Definir disponibilidades de atendimento;
 * - Criar, consultar, bloquear e cancelar slots;
 * - Expor a agenda publica ou autenticada de psicologos.
 *
 * <p>Dependencias permitidas:
 * - shared/config, shared/dto, shared/enums, shared/exception e shared/utils;
 * - services de outros modulos quando houver comunicacao entre dominios.
 *
 * <p>Dependencias proibidas:
 * - Qualquer repository de outro modulo.
 *
 * <p>Ponto de entrada externo: AgendaService.
 */
package com.psihub.api.modules.agenda;
