# Arquitetura do Backend PsiHub

O backend do PsiHub segue uma arquitetura modular dentro de uma aplicacao Spring Boot. A base de pacotes e `com.psihub.api`, separando codigo de dominio em `modules/` e codigo reutilizavel em `shared/`.

## Modelo Arquitetural

O projeto adota o formato de monolito modular. Todos os modulos executam na mesma aplicacao, mas cada dominio deve manter suas responsabilidades, dados e regras isoladas.

Essa abordagem reduz acoplamento sem introduzir a complexidade operacional de microsservicos. A fronteira entre modulos e expressa por pacotes Java, services e repositories.

## Organizacao de Pacotes

```text
com.psihub.api
  modules/
    {dominio}/
      controller/
      service/
      repository/
      entity/
      dto/
      mapper/
  shared/
    config/
    dto/
    entity/
    enums/
    exception/
    middleware/
    utils/
```

`modules/` contem codigo diretamente ligado a uma area de negocio. `shared/` contem infraestrutura, tipos comuns, utilitarios sem estado, excecoes globais e configuracoes reutilizadas por mais de um modulo.

## Regras de Dependencia

As dependencias permitidas seguem o fluxo abaixo:

```text
controller -> service -> repository -> entity
```

Regras obrigatorias:

- Controller importa apenas tipos do proprio modulo e de `shared/`
- Service importa repositories e entities do proprio modulo
- Service pode consumir service de outro modulo quando houver comunicacao entre dominios
- Repository importa apenas a entity do proprio modulo e tipos tecnicos necessarios
- `shared/` nao importa classes de `modules/`

Um modulo nunca deve acessar diretamente o repository de outro modulo. Essa regra preserva a fronteira de dominio e evita que regras internas vazem entre areas da aplicacao.

## Papel das Camadas

Controller recebe requisicoes HTTP, valida contratos de entrada e delega para services. Nao deve conter regra de negocio.

Service concentra regras de negocio, orquestracao e transacoes. Quando precisar consultar outro dominio, deve depender do service publico desse dominio.

Repository encapsula acesso a dados por Spring Data JPA. Deve permanecer restrito a entidade do proprio modulo.

Entity representa o modelo persistido por JPA/Hibernate. DTO representa contratos de API e nao deve ser usado como entidade persistida.

## Codigo Compartilhado

`shared/` deve permanecer pequeno e generico. Sao exemplos validos:

- Configuracoes Spring globais
- Tratamento global de excecoes
- DTOs padrao de resposta
- Enums realmente compartilhados
- Filtros e middleware de seguranca
- Utilitarios sem estado
- Entidades base de auditoria

Codigo que conhece uma regra especifica de agenda, consulta, sessao, paciente ou psicologo nao deve ficar em `shared/`.

## Pendencias Arquiteturais Conhecidas

A reorganizacao fisica foi aplicada, mas a auditoria encontrou dependencias que ainda precisam ser corrigidas antes de considerar a arquitetura totalmente conforme:

- Services dos modulos `auth`, `agenda`, `consultas` e `sessoes` ainda importam repositories de outros modulos
- `AgendaController` importa DTOs e service do modulo `consultas`
- `shared/utils/ApiResponseMapper.java` importa DTOs e entities de modulos de negocio
- `shared/config/MockDataSeeder.java` importa repositories e entities de varios modulos
- `shared/middleware/JwtAuthenticationFilter.java` depende diretamente de service do modulo `auth`

Esses pontos devem ser tratados como violacoes de fronteira. A documentacao operacional em `MODULE_MAP.md` registra onde elas aparecem no estado atual.
