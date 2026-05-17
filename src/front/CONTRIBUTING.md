# Guia de Contribuicao Frontend

Este guia explica como adicionar codigo sem quebrar a arquitetura modular do PsiHub.

## Antes de comecar

```bash
npm install
npm run lint
npm run build
```

## Onde cada tipo de codigo deve ficar

| Tipo | Local |
|---|---|
| Rota/tela | `src/pages/{Nome}/index.jsx` |
| Componente de dominio | `src/modules/{dominio}/components/{Componente}/index.jsx` |
| Hook de dominio | `src/modules/{dominio}/hooks/useNome.js` |
| Util de dominio | `src/modules/{dominio}/utils/{dominio}.utils.js` |
| Componente generico | `src/shared/components/{Componente}/index.jsx` |
| Hook generico | `src/shared/hooks/useNome.js` |
| Util generico | `src/shared/utils/nome.utils.js` |
| HTTP/API | `src/services/{dominio}.service.js` |
| Estado global | `src/store/{dominio}.store.js` ou `src/store/{dominio}.slice.js` |
| Estilos globais | `src/assets/styles/` |

## Como adicionar uma feature em modulo existente

1. Identifique o dominio: `auth`, `pacientes`, `psicologos` ou `admin`.
2. Coloque UI de dominio em `components/`.
3. Coloque regras com estado/effects em `hooks/`.
4. Coloque funcoes puras do dominio em `utils/`.
5. Coloque chamadas HTTP em `services/`.
6. Exporte somente o que for publico no barrel do modulo.
7. Atualize `MODULE_MAP.md`.

## Como criar um novo modulo

1. Crie `src/modules/{dominio}/components`, `hooks` e `utils`.
2. Crie ao menos um arquivo real do dominio.
3. Crie `src/modules/{dominio}/index.js`.
4. Adicione JSDoc no barrel.
5. Exporte nomes explicitamente.
6. Crie `src/pages/{Rota}/index.jsx` se houver nova rota.
7. Atualize `MODULE_MAP.md`.

## Imports corretos

Correto fora do modulo:

```js
import { PatientDashboard } from '@/modules/pacientes';
import { formatDate } from '@/shared/utils/date.utils';
```

Errado fora do modulo:

```js
import { PatientDashboard } from '@/modules/pacientes/components/PatientDashboard';
import { useAgenda } from '../../../modules/psicologos/hooks/useAgenda';
```

Dentro do proprio modulo, internals podem ser usados quando necessario, mas prefira caminhos claros.

## Data-fetching

Componentes e hooks de dominio nao devem chamar `fetch` ou `axios` diretamente. Crie uma funcao em `services/{dominio}.service.js` e consuma essa funcao.

```js
// services/example.service.js
import { apiRequest } from './http.service.js';

export const exampleApi = {
  list(signal) {
    return apiRequest('/api/example', { signal });
  },
};
```

## Barrel exports

Use exports nomeados:

```js
export { PatientDashboard } from './components/PatientDashboard';
```

Nao use:

```js
export * from './components/PatientDashboard';
```

## Checklist antes do PR

- [ ] `npm run lint` passou
- [ ] `npm run build` passou
- [ ] Nenhuma chamada HTTP foi adicionada fora de `services/`
- [ ] Nenhum import externo acessa internals de modulo
- [ ] Novo modulo possui `index.js` com JSDoc
- [ ] Services terminam com `.service.js`
- [ ] Utils terminam com `.utils.js`
- [ ] Hooks comecam com `use`
- [ ] Componentes estao em pasta PascalCase propria
- [ ] `MODULE_MAP.md` foi atualizado

## Testes

Ainda nao ha suite de testes configurada neste frontend. Quando testes forem adicionados, mantenha-os junto ao componente ou hook relacionado:

```text
components/Button/
  index.jsx
  Button.test.jsx
```
