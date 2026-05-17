# Guia de Contribuicao Frontend

Este guia define como adicionar codigo sem quebrar a arquitetura modular do frontend.

## Antes de Comecar

Rode:

```bash
npm install
npm run lint
npm run build
```

## Onde Cada Codigo Deve Ficar

| Tipo | Local |
|---|---|
| Tela/rota | `src/pages/{Nome}/index.jsx` |
| Componente de dominio | `src/modules/{dominio}/components/{Componente}/index.jsx` |
| Hook de dominio | `src/modules/{dominio}/hooks/useNome.js` |
| Util de dominio | `src/modules/{dominio}/utils/{dominio}.utils.js` |
| Componente generico | `src/shared/components/{Componente}/index.jsx` |
| Hook generico | `src/shared/hooks/useNome.js` |
| Util generico | `src/shared/utils/nome.utils.js` |
| HTTP/API | `src/services/{dominio}.service.js` |
| Estilos globais | `src/assets/styles/` |

## Como Criar Um Novo Modulo

1. Crie `src/modules/{dominio}`.
2. Crie ao menos um componente, hook ou util do dominio.
3. Crie `src/modules/{dominio}/index.js`.
4. Exporte nomes publicos explicitamente.
5. Crie ou atualize `src/services/{dominio}.service.js` se houver API.
6. Atualize `MODULE_MAP.md`.

## Imports

Certo:

```js
import { PatientDashboard } from '@/modules/pacientes';
import { formatDate } from '@/shared/utils/date.utils';
```

Errado:

```js
import { PatientDashboard } from '@/modules/pacientes/components/PatientDashboard';
import { Something } from '../../../modules/outroModulo';
```

## Regras Obrigatorias

- Nao use `export * from` em barrels.
- Nao importe internals de outro modulo.
- Nao chame `fetch` ou `axios` fora de `services/`.
- Nao coloque regra de negocio em `pages/`.
- Nao faça `shared/` depender de `modules/` ou `services/`.
- Use alias `@/` para imports entre camadas.

## Checklist Antes do PR

- [ ] `npm run lint` passou
- [ ] `npm run build` passou
- [ ] Novo modulo tem `index.js`
- [ ] Imports externos usam barrel export
- [ ] Services terminam com `.service.js`
- [ ] Utils terminam com `.utils.js`
- [ ] Hooks começam com `use`
- [ ] Nenhuma chamada HTTP foi adicionada fora de `services/`
- [ ] `MODULE_MAP.md` foi atualizado

## Testes

O projeto ainda nao possui suite de testes configurada. Quando testes forem adicionados, mantenha testes de componente junto ao componente:

```text
components/Button/
  index.jsx
  Button.test.jsx
```
