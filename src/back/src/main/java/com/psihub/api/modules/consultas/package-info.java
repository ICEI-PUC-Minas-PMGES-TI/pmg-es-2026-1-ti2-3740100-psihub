/**
 * Modulo de gerenciamento de consultas.
 *
 * <p>Responsabilidades:
 * - Agendar consultas;
 * - Confirmar e cancelar consultas;
 * - Consultar historico e detalhes de atendimentos.
 *
 * <p>Dependencias permitidas:
 * - shared/config, shared/dto, shared/enums, shared/exception e shared/utils;
 * - services de outros modulos, como notificacoes, quando necessario.
 *
 * <p>Dependencias proibidas:
 * - Qualquer repository de outro modulo.
 *
 * <p>Ponto de entrada externo: ConsultaService.
 */
package com.psihub.api.modules.consultas;
