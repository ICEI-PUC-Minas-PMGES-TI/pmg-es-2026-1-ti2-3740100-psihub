# Arquitetura Frontend

O frontend do PsiHub segue uma arquitetura modular para manter telas, dominios, codigo compartilhado e chamadas HTTP separados.

## Principios

- Separar composicao de tela, regra de dominio e infraestrutura HTTP
- Exportar modulos por barrel export (`index.js`)
- Evitar imports relativos profundos usando o alias `@/`
- Centralizar chamadas HTTP em `services/`
- Manter `shared/` livre de dependencia de dominio

## Camadas

```text
pages       -> modules, shared, store
modules     -> shared, services, store
shared      -> React e bibliotecas externas
services    -> fetch e utilitarios compartilhados
store       -> services e shared/utils
```

## Pages

`pages/` deve montar componentes de modulo e repassar props. Uma page nao deve conter chamada HTTP, regra de negocio, validacao complexa ou manipulacao direta de dados da API.

## Modules

`modules/{dominio}` concentra componentes, hooks e utils de um dominio. Codigo externo deve importar apenas do barrel:

```js
import { PatientDashboard } from '@/modules/pacientes';
```

Nao importe arquivos internos de outro modulo.

## Shared

`shared/` contem componentes e utilitarios genericos. Ele pode depender de React, lucide-react e outras bibliotecas externas, mas nao pode depender de `modules/` ou `services/`.

## Services

Toda comunicacao HTTP fica em `services/`. O cliente base e `http.service.js`; os services de dominio expõem funcoes de mais alto nivel, como `auth.service.js` e `scheduling.service.js`.

## Estilos

O projeto usa Tailwind e CSS global legado em `assets/styles/global.css`. Novos estilos especificos de componente devem preferir colocation e CSS Modules quando forem criados.

## Escala

Ao criar um novo dominio, adicione `modules/{dominio}/index.js`, components em pasta propria, hooks de dominio em `hooks/`, utils em `{dominio}.utils.js` e chamadas HTTP em `services/{dominio}.service.js`.

## Dividas Conhecidas

Alguns componentes ainda concentram UI e regras de negocio. Essa situacao esta registrada em `MODULE_MAP.md` e deve ser tratada gradualmente, sem alterar comportamento.
