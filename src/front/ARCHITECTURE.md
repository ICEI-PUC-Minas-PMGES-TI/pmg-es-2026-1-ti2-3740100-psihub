# Arquitetura Frontend

O frontend do PsiHub usa arquitetura modular por dominio. O objetivo e manter rotas finas, regras de negocio agrupadas por contexto e infraestrutura HTTP centralizada.

## Principios

1. Separar composicao de tela, regra de dominio e comunicacao HTTP.
2. Expor modulos apenas por barrel export (`src/modules/{dominio}/index.js`).
3. Manter `shared/` independente de qualquer dominio.
4. Usar alias `@/` para imports entre camadas.
5. Preservar comportamento existente ao reorganizar codigo legado.

## Hierarquia de dependencias

```text
pages       -> modules, shared, store
modules     -> shared, services, store
shared      -> React e bibliotecas externas
services    -> shared/utils e APIs nativas/libs HTTP
store       -> services e shared/utils
```

Proibido:

- `shared/` importar `modules/`, `services/` ou `store/`
- um modulo importar internals de outro modulo
- componentes chamarem `fetch` ou `axios`
- `pages/` conterem regra de negocio
- barrels usarem `export * from`

## Pages

`pages/` representa pontos de montagem. Uma page pode importar um modulo por barrel e repassar props:

```jsx
import { PatientDashboard as PatientDashboardModule } from '@/modules/pacientes';

export function PatientDashboard(props) {
  return <PatientDashboardModule {...props} />;
}
```

Pages nao devem validar regras, buscar dados, transformar payloads ou acessar services diretamente.

## Modules

`modules/{dominio}` contem componentes, hooks e utils especificos do dominio. Codigo externo deve importar apenas do `index.js` do modulo.

Exemplo permitido:

```js
import { PsychologistAgendaPage } from '@/modules/psicologos';
```

Exemplo proibido fora do proprio modulo:

```js
import { useAgenda } from '@/modules/psicologos/hooks/useAgenda';
```

## Shared

`shared/` contem codigo reutilizavel e sem conhecimento de dominio: layout, UI generica, hooks genericos e utils puras. Ele pode depender de React, lucide-react e APIs nativas do navegador.

## Services

`services/` concentra comunicacao HTTP. `http.service.js` e o cliente base; os demais services agrupam endpoints por area funcional.

Services atuais:

- `auth.service.js`
- `clinical.service.js`
- `scheduling.service.js`
- `http.service.js`

## Store

`store/` esta reservado para estado global futuro. O projeto atual usa estado local e hooks.

## Estilos

O projeto usa Tailwind e CSS global legado em `src/assets/styles/global.css`. Novos estilos especificos de componente devem preferir colocation e CSS Modules quando o componente for criado ou revisitado.

## Como escalar

Ao criar um novo dominio:

1. Crie `src/modules/{dominio}/`.
2. Coloque componentes em `components/{Componente}/index.jsx`.
3. Coloque hooks de negocio em `hooks/useNome.js`.
4. Coloque utils especificas em `utils/{dominio}.utils.js`.
5. Crie ou atualize `src/services/{dominio}.service.js` se houver HTTP.
6. Exporte apenas a interface publica em `src/modules/{dominio}/index.js`.
7. Atualize `MODULE_MAP.md`.
