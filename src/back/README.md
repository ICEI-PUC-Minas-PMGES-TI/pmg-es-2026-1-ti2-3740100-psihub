# Backend PsiHub

Backend em Java 25 com Spring Boot 3, Spring Data JPA/Hibernate, Flyway e MySQL 8.

O backend implementa APIs para:

- autenticação JWT de pacientes e psicólogos;
- agenda e disponibilidade do psicólogo;
- agendamento, confirmação e cancelamento de consultas;
- preparação, rascunho, encerramento e linha do tempo de sessões;
- consulta de psicólogos disponíveis.

## Requisitos

- JDK 25
- Docker, opcional para subir MySQL e backend em containers

O projeto usa Maven Wrapper. Não é necessário instalar Maven globalmente.

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

Para reconstruir a imagem do backend após alterações:

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

Na primeira execução, o wrapper baixa a distribução Maven definida em `.mvn/wrapper/maven-wrapper.properties`. Se `.mvn/wrapper/maven-wrapper.jar` não existir, os scripts também baixam o jar do Maven Wrapper.

## Validação local

Windows:

```bash
.\mvnw.cmd -q -DskipTests compile
```

Linux/macOS:

```bash
./mvnw -q -DskipTests compile
```

Se a validação falhar com mensagem de compilador ausente, confira se o `JAVA_HOME` aponta para um JDK 25. JRE não é suficiente.

## Configuração

Variáveis de ambiente aceitas:

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

Valores padrão:

- `DB_URL=jdbc:mysql://localhost:3306/psihub?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo`
- `BACKEND_DB_URL=jdbc:mysql://mysql:3306/psihub?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo`
- `DB_USERNAME=psihub`
- `DB_PASSWORD=psihub`
- `SERVER_PORT=8080`
- `JWT_SECRET` não possui valor padrão e deve ter pelo menos 32 caracteres

O `application.yml` importa `optional:file:.env[.properties]`, então um `.env` local pode definir essas variáveis sem alterar o código. Use `.env.exemple` como base.

## Autenticação

Rotas públicas:

```http
POST /auth/register
POST /auth/login
```

As demais rotas `/api/**` exigem `Authorization: Bearer <token>`. O token é assinado com `JWT_SECRET`, expira em 7 dias e carrega `userId`, `email` e `tipo`.

Exemplo de cadastro:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "senhaSegura123",
  "tipo": "paciente"
}
```

Para psicólogos autenticados, use as rotas de agenda com `me`, por exemplo:

```http
POST /api/psicologos/me/disponibilidades
GET /api/psicologos/me/agenda/slots
```

Para pacientes autenticados, o backend usa o `userId` do token ao listar, agendar e cancelar consultas. Não envie `pacienteId` ou `agendadoPorUsuarioId` no corpo da requisição.

## Seed local

Em ambientes fora de produção, o backend popula dados mockados automaticamente na inicialização quando a tabela `usuarios` está vazia. O seed cria 2 psicólogos, 3 pacientes, regras de disponibilidade, slots futuros e consultas agendadas/concluídas usando a senha `senha123`.

O seed não roda quando `NODE_ENV=production` ou quando o profile ativo é `production`/`prod`.

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

- Apenas psicólogos com `statusAcesso=ATIVO` podem criar disponibilidade, slots e receber agendamentos.
- Slots só podem ser agendados quando estão com status `DISPONIVEL`.
- Ao agendar consulta, o slot passa para `RESERVADO`.
- Ao cancelar consulta, o slot volta para `DISPONIVEL`.
- O relacionamento `Consulta -> SlotConsulta` permite histórico de mais de uma consulta para o mesmo slot, necessário para reagendar após cancelamento.
- A sessão só pode iniciar para consulta `AGENDADA`, `CONFIRMADA` ou `EM_ANDAMENTO`.
- A sessão não pode iniciar para data futura.
- A sessão só pode encerrar quando estiver `EM_ANDAMENTO`.
- O encerramento exige anotações clinicas e evolução clínica.
- A linha do tempo retorna apenas prontuários marcados com `incluirLinhaTempo=true`.

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

Retorna psicólogos ativos, com nome, CRP, valor de consulta, biografia e especialidades.

### Agenda e disponibilidade

#### Definir disponibilidade recorrente

```http
POST /api/psicologos/{psicologoId}/disponibilidades
```

Cria regras recorrentes e gera slots dentro do período informado.

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
  "motivoCancelamento": "Paciente solicitou remarcação"
}
```

### Sessões e prontuários

#### Preparar sessão

```http
GET /api/consultas/{consultaId}/sessao/preparacao
```

Retorna dados da consulta, resumo emocional do paciente no período anterior e prontuário existente, se houver.

#### Iniciar sessão

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

#### Salvar rascunho da sessão

```http
PUT /api/consultas/{consultaId}/sessao/rascunho
```

```json
{
  "anotacoesClinicas": "Anotçõoes parciais da sessão",
  "temasSessao": ["Ansiedade", "Trabalho"],
  "nivelEngajamento": "MEDIO",
  "intercorrencias": "Sem intercorrências"
}
```

#### Encerrar sessão

```http
POST /api/consultas/{consultaId}/sessao/encerrar
```

```json
{
  "anotacoesClinicas": "Registro clínico final",
  "temasSessao": ["Ansiedade", "Autoestima"],
  "nivelEngajamento": "ALTO",
  "intercorrencias": "Sem intercorrências",
  "evolucaoClinica": "Paciente apresentou melhora no manejo de ansiedade",
  "intervencoes": ["TCC"],
  "tarefasEncaminhamentos": "Registrar pensamentos automáticos durante a semana",
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

- `psicologoId`: obrigatório
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
  "message": "Operação realizada com sucesso",
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
  "message": "Operação realizada com sucesso",
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
  "message": "Requisição inválida",
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

- `V1__create_initial_schema.sql`: schema inicial consolidado.

O schema usa triggers MySQL para regras de integridade entre consultas,
pagamentos, avaliações e evoluções clínicas. No Docker Compose local, o MySQL
sobe com `--log-bin-trust-function-creators=1` para permitir que o Flyway crie
esses triggers usando o usuário da aplicação.

Se uma migration falhar no meio da primeira inicialização, o Flyway registra a
versão como falhada e o banco pode ficar parcialmente criado. Em desenvolvimento,
o caminho mais simples é recriar o volume do MySQL antes de subir novamente:

```bash
docker compose down -v
docker compose up -d --build
```
