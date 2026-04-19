## 4. Projeto da solução

### 4.1. Modelo de dados

O modelo relacional do PsiHub foi definido para cobrir os cinco processos de negocio: gestao do psicologo, gestao do paciente, processo da sessao, gestao financeira e agendamento de consultas. A estrutura foi organizada para garantir rastreabilidade clinica, controle financeiro, integridade dos agendamentos e conformidade com LGPD.

![Modelo relacional do PsiHub](images/modeloRelacional.png "Modelo Relacional do PsiHub")

### 4.2. Tecnologias

_Descreva qual(is) tecnologias você vai usar para resolver o seu problema, ou seja, implementar a sua solução. Liste todas as tecnologias envolvidas, linguagens a serem utilizadas, serviços Web, frameworks, bibliotecas, IDEs de desenvolvimento, e ferramentas._

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

