# Mapa de Modulos

Este documento descreve o inventario operacional dos modulos atuais do backend. Ele nao substitui as regras arquiteturais de `ARCHITECTURE.md`; seu objetivo e mostrar responsabilidades, pontos de entrada, entidades, endpoints e dependencias observadas.

## Modulo: agenda

| Item | Detalhe |
|---|---|
| Dominio | Disponibilidades, slots e agenda de psicologos |
| Ponto de entrada | `AgendaService` |
| Entidades | `RegraDisponibilidade`, `SlotConsulta`, `ExcecaoDisponibilidade`, `TipoExcecaoDisponibilidade` |
| Endpoints base | `/api/psicologos` |
| Consome permitido | `shared/*`, services de outros modulos quando necessario |
| Consome atualmente | Repositories de `consultas`, `pacientes` e `psicologos` |
| Consumido por | Controllers de agenda e fluxos de consulta |
| Observacao | Ha dependencia cruzada indevida por repository externo |

## Modulo: auth

| Item | Detalhe |
|---|---|
| Dominio | Registro, login, usuarios e emissao de JWT |
| Ponto de entrada | `AuthService`, `JwtService` |
| Entidades | `Usuario` |
| Endpoints base | `/auth` |
| Consome permitido | `shared/*`, services de outros modulos quando necessario |
| Consome atualmente | Repositories de `pacientes` e `psicologos` |
| Consumido por | Controller de autenticacao e middleware de autenticacao |
| Observacao | Ha dependencia cruzada indevida por repository externo |

## Modulo: consultas

| Item | Detalhe |
|---|---|
| Dominio | Agendamento, confirmacao, cancelamento e consulta de atendimentos |
| Ponto de entrada | `ConsultaService` |
| Entidades | `Consulta` |
| Endpoints base | `/api/consultas` |
| Consome permitido | `shared/*`, `NotificacaoService` |
| Consome atualmente | Repositories de `agenda`, `auth`, `pacientes` e `psicologos`; `NotificacaoService` |
| Consumido por | Controllers de consulta, agenda e sessoes |
| Observacao | Ha dependencia cruzada indevida por repository externo |

## Modulo: financeiro

| Item | Detalhe |
|---|---|
| Dominio | Pagamentos, recibos e status financeiro de consultas |
| Ponto de entrada | Nao definido nesta versao |
| Entidades | `Pagamento`, `Recibo`, `FormaPagamento`, `StatusPagamento` |
| Endpoints base | Nao possui controller nesta versao |
| Consome permitido | `shared/*` |
| Consome atualmente | Entidades relacionadas a consulta por associacao JPA |
| Consumido por | Modelo de consultas |
| Observacao | Modulo composto por entidades no estado atual |

## Modulo: notificacoes

| Item | Detalhe |
|---|---|
| Dominio | Criacao e persistencia de notificacoes |
| Ponto de entrada | `NotificacaoService` |
| Entidades | `Notificacao` |
| Endpoints base | Nao possui controller nesta versao |
| Consome permitido | `shared/*` |
| Consome atualmente | Repository do proprio modulo |
| Consumido por | `ConsultaService` |
| Observacao | Consumo por service esta alinhado a regra de comunicacao entre modulos |

## Modulo: pacientes

| Item | Detalhe |
|---|---|
| Dominio | Dados cadastrais e perfil de pacientes |
| Ponto de entrada | Nao definido nesta versao |
| Entidades | `Paciente` |
| Endpoints base | Nao possui controller proprio nesta versao |
| Consome permitido | `shared/*` |
| Consome atualmente | Repository e DTOs do proprio modulo |
| Consumido por | `AuthService`, `AgendaService`, `ConsultaService` |
| Observacao | Consumo atual ocorre por repository externo e viola a fronteira do modulo |

## Modulo: psicologos

| Item | Detalhe |
|---|---|
| Dominio | Perfil profissional, especialidades e busca de psicologos disponiveis |
| Ponto de entrada | `PsicologoService` |
| Entidades | `Psicologo`, `EspecialidadePsicologo` |
| Endpoints base | `/api/psicologos` |
| Consome permitido | `shared/*` |
| Consome atualmente | Repositories do proprio modulo |
| Consumido por | `AuthService`, `AgendaService`, `ConsultaService` |
| Observacao | Consumo externo deve ocorrer via `PsicologoService`, nao por repository |

## Modulo: registros

| Item | Detalhe |
|---|---|
| Dominio | Registros emocionais de pacientes |
| Ponto de entrada | Nao definido nesta versao |
| Entidades | `RegistroEmocional` |
| Endpoints base | Nao possui controller nesta versao |
| Consome permitido | `shared/*` |
| Consome atualmente | Repository do proprio modulo |
| Consumido por | `SessaoService` |
| Observacao | Consumo atual ocorre por repository externo e viola a fronteira do modulo |

## Modulo: sessoes

| Item | Detalhe |
|---|---|
| Dominio | Preparacao, inicio, rascunho, encerramento e prontuario de sessoes |
| Ponto de entrada | `SessaoService` |
| Entidades | `ProntuarioSessao`, `NivelEngajamento` |
| Endpoints base | `/api/consultas/{consultaId}/sessao`, `/api/pacientes/{pacienteId}/linha-do-tempo`, `/api/prontuarios/{prontuarioId}` |
| Consome permitido | `shared/*`, services de outros modulos quando necessario |
| Consome atualmente | Repositories de `consultas` e `registros` |
| Consumido por | `SessaoController` |
| Observacao | Ha dependencia cruzada indevida por repository externo |

## Modulo: vinculos

| Item | Detalhe |
|---|---|
| Dominio | Vinculo entre psicologo e paciente |
| Ponto de entrada | Nao definido nesta versao |
| Entidades | `VinculoPsicologoPaciente`, `StatusVinculo` |
| Endpoints base | Nao possui controller nesta versao |
| Consome permitido | `shared/*` |
| Consome atualmente | Entidades relacionadas por associacao JPA |
| Consumido por | Modelo de relacionamento entre pacientes e psicologos |
| Observacao | Modulo composto por entidades no estado atual |
