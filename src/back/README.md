# Backend PsiHub

Backend em Java 25 com Spring Boot 3, Spring Data JPA/Hibernate, Flyway e MySQL 8.

O backend implementa APIs para:

- autenticacao JWT de pacientes e psicologos;
- agenda e disponibilidade do psicologo;
- agendamento, confirmacao e cancelamento de consultas;
- preparacao, rascunho, encerramento e linha do tempo de sessoes;
- consulta de psicologos disponiveis.

## Requisitos

- JDK 25
- Docker, opcional para subir MySQL e backend em containers

O projeto usa Maven Wrapper. Nao e necessario instalar Maven globalmente.

## Executar com Docker Compose

```bash
docker compose up -d
```

O Compose sobe:

- backend Java em `localhost:8080`;
- MySQL em `localhost:3306`.

O banco usa:

- database: `psihub`
- user: `psihub`
- password: `psihub`

Para subir apenas o banco:

```bash
docker compose up -d mysql
```

Para reconstruir a imagem do backend apos alteracoes:

```bash
docker compose up -d --build backend
```

## Executar localmente sem Docker para o backend

Windows:

```bash
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Na primeira execucao, o wrapper baixa a distribuicao Maven definida em `.mvn/wrapper/maven-wrapper.properties`. Se `.mvn/wrapper/maven-wrapper.jar` nao existir, os scripts tambem baixam o jar do Maven Wrapper.

## Validacao local

Windows:

```bash
.\mvnw.cmd -q -DskipTests compile
```

Linux/macOS:

```bash
./mvnw -q -DskipTests compile
```

Se a validacao falhar com mensagem de compilador ausente, confira se o `JAVA_HOME` aponta para um JDK 25. JRE nao e suficiente.

## Configuracao

Variaveis de ambiente aceitas:

- `DB_URL`
- `BACKEND_DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SERVER_PORT`
- `JWT_SECRET`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`

Valores padrao:

- `DB_URL=jdbc:mysql://localhost:3306/psihub?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo`
- `BACKEND_DB_URL=jdbc:mysql://mysql:3306/psihub?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo`
- `DB_USERNAME=psihub`
- `DB_PASSWORD=psihub`
- `SERVER_PORT=8080`
- `JWT_SECRET` nao possui valor padrao e deve ter pelo menos 32 caracteres

O `application.yml` importa `optional:file:.env[.properties]`, entao um `.env` local pode definir essas variaveis sem alterar o codigo. Use `.env.exemple` como base.

## Autenticacao

Rotas publicas:

```http
POST /auth/register
POST /auth/login
```

As demais rotas `/api/**` exigem `Authorization: Bearer <token>`. O token e assinado com `JWT_SECRET`, expira em 7 dias e carrega `userId`, `email` e `tipo`.

Exemplo de cadastro:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "senhaSegura123",
  "tipo": "paciente"
}
```

Para psicologos autenticados, use as rotas de agenda com `me`, por exemplo:

```http
POST /api/psicologos/me/disponibilidades
GET /api/psicologos/me/agenda/slots
```

Para pacientes autenticados, o backend usa o `userId` do token ao listar, agendar e cancelar consultas. Nao envie `pacienteId` ou `agendadoPorUsuarioId` no corpo da requisicao.

## Seed local

Em ambientes fora de producao, o backend popula dados mockados automaticamente na inicializacao quando a tabela `usuarios` esta vazia. O seed cria 2 psicologos, 3 pacientes, regras de disponibilidade, slots futuros e consultas agendadas/concluidas usando a senha `senha123`.

O seed nao roda quando `NODE_ENV=production` ou quando o profile ativo e `production`/`prod`.

## Estrutura

```text
src/main/java/psihub
+-- PsiHubApplication.java
+-- clients/
+-- configs/
+-- controllers/
+-- domain/
|   +-- enums/
|   +-- model/
+-- dtos/
+-- exceptions/
+-- mappers/
+-- repositories/
+-- services/
```

## Regras implementadas

- Apenas psicologos com `statusAcesso=ATIVO` podem criar disponibilidade, slots e receber agendamentos.
- Slots so podem ser agendados quando estao com status `DISPONIVEL`.
- Ao agendar consulta, o slot passa para `RESERVADO`.
- Ao cancelar consulta, o slot volta para `DISPONIVEL`.
- O relacionamento `Consulta -> SlotConsulta` permite historico de mais de uma consulta para o mesmo slot, necessario para reagendar apos cancelamento.
- A sessao so pode iniciar para consulta `AGENDADA`, `CONFIRMADA` ou `EM_ANDAMENTO`.
- A sessao nao pode iniciar para data futura.
- A sessao so pode encerrar quando estiver `EM_ANDAMENTO`.
- O encerramento exige anotacoes clinicas e evolucao clinica.
- A linha do tempo retorna apenas prontuarios marcados com `incluirLinhaTempo=true`.

## Enums usados nas APIs

- `DiaSemana`: `SEGUNDA`, `TERCA`, `QUARTA`, `QUINTA`, `SEXTA`, `SABADO`, `DOMINGO`
- `StatusSlotConsulta`: `DISPONIVEL`, `RESERVADO`, `BLOQUEADO`, `CANCELADO`
- `TipoAtendimento`: `ONLINE`, `PRESENCIAL`
- `StatusConsulta`: `AGENDADA`, `CONFIRMADA`, `EM_ANDAMENTO`, `CONCLUIDA`, `CANCELADA`, `FALTOU`
- `NivelEngajamento`: `BAIXO`, `MEDIO`, `ALTO`

## Endpoints

Base URL local: `http://localhost:8080`

### Psicologos

#### Listar psicologos disponiveis

```http
GET /api/psicologos/disponiveis
```

Retorna psicologos ativos, com nome, CRP, valor de consulta, biografia e especialidades.

### Agenda e disponibilidade

#### Definir disponibilidade recorrente

```http
POST /api/psicologos/{psicologoId}/disponibilidades
```

Cria regras recorrentes e gera slots dentro do periodo informado.

```json
{
  "diasSemana": ["SEGUNDA", "QUARTA"],
  "horaInicio": "08:00:00",
  "horaFim": "12:00:00",
  "duracaoSlotMinutos": 50,
  "validoAPartirDe": "2026-05-10",
  "validoAte": "2026-06-10",
  "gerarAte": "2026-05-31"
}
```

#### Listar regras de disponibilidade

```http
GET /api/psicologos/{psicologoId}/disponibilidades
```

#### Criar slot manual

```http
POST /api/psicologos/{psicologoId}/agenda/slots
```

```json
{
  "data": "2026-05-12",
  "horaInicio": "14:00:00",
  "horaFim": "14:50:00"
}
```

#### Listar slots da agenda

```http
GET /api/psicologos/{psicologoId}/agenda/slots
```

Query params opcionais:

- `inicio`: data e hora ISO, exemplo `2026-05-10T00:00:00`
- `fim`: data e hora ISO, exemplo `2026-05-20T00:00:00`
- `status`: `DISPONIVEL`, `RESERVADO`, `BLOQUEADO` ou `CANCELADO`

#### Listar slots disponiveis

```http
GET /api/psicologos/{psicologoId}/agenda/slots/disponiveis
```

Query params opcionais:

- `data`: data ISO, exemplo `2026-05-12`

#### Bloquear slot

```http
PATCH /api/psicologos/{psicologoId}/agenda/slots/{slotId}/bloquear
```

```json
{
  "motivo": "Compromisso externo"
}
```

#### Cancelar slot

```http
PATCH /api/psicologos/{psicologoId}/agenda/slots/{slotId}/cancelar
```

Cancela um slot sem consulta reservada.

### Consultas

#### Agendar consulta

```http
POST /api/consultas/agendamentos
```

```json
{
  "pacienteId": 1,
  "psicologoId": 2,
  "slotConsultaId": 10,
  "agendadoPorUsuarioId": 1,
  "tipoAtendimento": "ONLINE",
  "observacoes": "Primeira consulta"
}
```

#### Listar consultas

```http
GET /api/consultas
```

Query params opcionais:

- `pacienteId`
- `psicologoId`
- `status`
- `inicio`: data ISO, exemplo `2026-05-01`
- `fim`: data ISO, exemplo `2026-05-31`

#### Detalhar consulta

```http
GET /api/consultas/{consultaId}
```

#### Confirmar consulta

```http
PATCH /api/consultas/{consultaId}/confirmar
```

#### Cancelar consulta

```http
PATCH /api/consultas/{consultaId}/cancelar
```

```json
{
  "motivoCancelamento": "Paciente solicitou remarcacao"
}
```

### Sessoes e prontuarios

#### Preparar sessao

```http
GET /api/consultas/{consultaId}/sessao/preparacao
```

Retorna dados da consulta, resumo emocional do paciente no periodo anterior e prontuario existente, se houver.

#### Iniciar sessao

```http
POST /api/consultas/{consultaId}/sessao/iniciar
```

Body opcional:

```json
{
  "iniciadoEm": "2026-05-12T14:00:00",
  "observacoesPreSessao": "Paciente relatou ansiedade antes da consulta"
}
```

#### Salvar rascunho da sessao

```http
PUT /api/consultas/{consultaId}/sessao/rascunho
```

```json
{
  "anotacoesClinicas": "Anotacoes parciais da sessao",
  "temasSessao": ["Ansiedade", "Trabalho"],
  "nivelEngajamento": "MEDIO",
  "intercorrencias": "Sem intercorrencias"
}
```

#### Encerrar sessao

```http
POST /api/consultas/{consultaId}/sessao/encerrar
```

```json
{
  "anotacoesClinicas": "Registro clinico final",
  "temasSessao": ["Ansiedade", "Autoestima"],
  "nivelEngajamento": "ALTO",
  "intercorrencias": "Sem intercorrencias",
  "evolucaoClinica": "Paciente apresentou melhora no manejo de ansiedade",
  "intervencoes": ["TCC"],
  "tarefasEncaminhamentos": "Registrar pensamentos automaticos durante a semana",
  "nivelProgresso": 7,
  "incluirLinhaTempo": true,
  "finalizadoEm": "2026-05-12T14:50:00"
}
```

#### Linha do tempo do paciente

```http
GET /api/pacientes/{pacienteId}/linha-do-tempo
```

Query params:

- `psicologoId`: obrigatorio
- `inicio`: opcional, data ISO
- `fim`: opcional, data ISO
- `tema`: opcional

#### Detalhar prontuario

```http
GET /api/prontuarios/{prontuarioId}
```

## Formato das respostas

Todas as APIs retornam um envelope padronizado.

Resposta de sucesso com objeto:

```json
{
  "success": true,
  "data": {
    "id": 1
  },
  "message": "Operacao realizada com sucesso",
  "meta": null,
  "errors": [],
  "timestamp": "2026-05-09T20:00:00"
}
```

Resposta de sucesso com lista:

```json
{
  "success": true,
  "data": [],
  "message": "Operacao realizada com sucesso",
  "meta": {
    "page": null,
    "size": null,
    "totalItems": 0,
    "totalPages": null,
    "itemCount": 0
  },
  "errors": [],
  "timestamp": "2026-05-09T20:00:00"
}
```

Resposta de falha:

```json
{
  "success": false,
  "data": null,
  "message": "Requisicao invalida",
  "meta": null,
  "errors": [
    {
      "field": "pacienteId",
      "message": "must not be null",
      "code": "VALIDATION_ERROR"
    }
  ],
  "timestamp": "2026-05-09T20:00:00"
}
```

## Migrations

- `V1__create_initial_schema.sql`: schema inicial.
- `V2__allow_reusing_cancelled_slots.sql`: remove a unicidade de `consultas.slot_consulta_id` e cria indice por slot/status, permitindo historico de cancelamentos e reagendamentos.
