## 4. Projeto da solução

## 4.0 Detalhamento das atividades

### 4.0.1 Gestão do Psicólogo
Este processo é responsável pelo gerenciamento dos dados dos profissionais cadastrados na plataforma, permitindo controle e atualização das informações do psicólogo.

**Tarefa**

- Cadastrar psicólogo
- Atualizar perfil
- Consultar dados
- Excluir cadastro

**Campos**
- id_psicologo
- nome
- cpf
- crp
- email
- telefone

**Comandos**
- Criar
- Atualizar
- Buscar
- Excluir


### 4.0.2 Gestão do Paciente
Este processo permite o cadastro, atualização e consulta dos dados dos pacientes atendidos na plataforma.

**Tarefa**
- Cadastrar paciente
- Atualizar dados
- Consultar cadastro

**Campos**
- id_paciente
- nome
- cpf
- histórico clínico

**Comandos**
- Criar
- Atualizar
- Buscar


### 4.0.3 Processo da Sessão
Este processo registra as sessões realizadas, incluindo anotações clínicas e evolução do paciente.

**Tarefa**
- Registrar sessão
- Inserir anotações
- Finalizar sessão

**Campos**
- id_sessao
- data
- observacoes
- diagnostico

**Comandos**
- Criar sessão
- Atualizar sessão
- Consultar sessão


### 4.0.4 Gestão Financeira
Este processo gerencia os pagamentos e o controle financeiro das consultas realizadas.

**Tarefa**
- Registrar pagamento
- Consultar pagamentos
- Gerar relatório

**Campos**
- id_pagamento
- valor
- status

**Comandos**
- Registrar
- Consultar
- Gerar relatório


### 4.0.5 Agendamento de Consultas
Este processo permite o gerenciamento das consultas, incluindo criação, remarcação e cancelamento.

**Tarefa**
- Criar agendamento
- Reagendar
- Cancelar consulta

**Campos**
- id_consulta
- data
- horario
- status

**Comandos**
- Criar
- Atualizar
- Cancelar

### 4.1. Modelo de dados

O modelo relacional do PsiHub foi definido para cobrir os cinco processos de negocio: gestao do psicologo, gestao do paciente, processo da sessao, gestao financeira e agendamento de consultas. A estrutura foi organizada para garantir rastreabilidade clinica, controle financeiro, integridade dos agendamentos e conformidade com LGPD.

![Modelo relacional do PsiHub](images/modeloRelacional.png "Modelo Relacional do PsiHub")

### 4.2. Tecnologias

| **Dimensao** | **Tecnologia** | **Uso no projeto** |
| --- | --- | --- |
| Linguagem Back-end | Java 21 | Implementacao da API e regras de negocio |
| Framework Back-end | Spring Boot | Estrutura principal da aplicacao server-side |
| Banco de Dados | MySQL 8 | Armazenamento relacional dos dados clinicos, agenda e financeiro |
| Front-end | HTML5 + CSS3 + JavaScript | Interface para psicologo e paciente |
| Prototipacao/UI | Figma | Definicao de fluxos e telas antes da implementacao |
| Documentacao de API | OpenAPI (Swagger) | Documentacao e validacao dos endpoints |
| Controle de versao | Git + GitHub | Versionamento, colaboracao e revisao de codigo |
| IDEs/Ferramentas | VS Code, Postman | Desenvolvimento e testes de API |

