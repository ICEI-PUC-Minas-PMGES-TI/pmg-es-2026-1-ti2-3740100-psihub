# Backend PsiHub

Backend em Java 21 com Spring Boot, JPA/Hibernate, Flyway e MySQL 8.

Esta base inicial prepara a camada de banco de dados do PsiHub:

- projeto Spring Boot configurado;
- migration Flyway com o schema relacional inicial;
- entidades JPA em `domain/model`;
- enums compartilhados em `domain/enums`;
- pastas reservadas para as proximas camadas da aplicacao.

## Requisitos

- JDK 21
- Maven 3.9+
- Docker, opcional para subir o MySQL local

## Banco local

```bash
docker compose up -d
```

O banco sobe em `localhost:3306` com:

- database: `psihub`
- user: `psihub`
- password: `psihub`

## Executar

```bash
mvn spring-boot:run
```

As migrations Flyway em `src/main/resources/db/migration` criam o schema relacional na subida da aplicacao.

## Configuracao

Variaveis de ambiente aceitas:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SERVER_PORT`

Valores padrao:

- `DB_URL=jdbc:mysql://localhost:3306/psihub?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo`
- `DB_USERNAME=psihub`
- `DB_PASSWORD=psihub`
- `SERVER_PORT=8080`

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

Observacoes:

- `repositories/` esta vazio de proposito. Os repositories serao criados em uma etapa futura.
- As pastas vazias possuem `.gitkeep` para serem versionadas.
- O schema do banco fica versionado em `src/main/resources/db/migration/V1__create_initial_schema.sql`.

## Validacao local

```bash
mvn -q -DskipTests compile
```

Se o comando falhar por `mvn` nao encontrado ou versao antiga do Java, instale Maven 3.9+ e JDK 21 antes de executar.
