# PsiHub Frontend

Frontend React/Vite do PsiHub. A aplicacao atende os fluxos de autenticacao, area do paciente, area do psicologo, agenda de consultas, registros emocionais, relatorios e administracao de acesso de psicologos.

## Pre-requisitos

- Node.js 22 ou versao compativel com Vite 6
- npm
- Backend PsiHub rodando localmente ou URL remota configurada

## Instalacao

```bash
npm install
```

## Como rodar em desenvolvimento

```bash
npm run dev
```

Por padrao, o Vite sobe em `http://localhost:5173` e encaminha chamadas `/api` para `http://localhost:8080`.

Para trocar o backend usado pelo proxy:

```powershell
$env:VITE_BACKEND_PROXY_TARGET="http://localhost:8081"; npm run dev
```

Para chamar uma API absoluta sem depender do proxy:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8080"; npm run dev
```

## Scripts

| Comando | Finalidade |
|---|---|
| `npm run dev` | Inicia o servidor Vite em modo desenvolvimento |
| `npm run build` | Gera build de producao em `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | Executa ESLint |

## Estrutura de pastas

```text
src/
  pages/      wrappers de rota; montam modulos e repassam props
  modules/    codigo por dominio de negocio
  shared/     componentes, hooks e utils sem regra de dominio
  services/   toda comunicacao HTTP
  store/      reservado para estado global futuro
  assets/     estilos globais, imagens e icones estaticos
```

## Regras essenciais

- Importe dominios por barrel: `import { PatientDashboard } from '@/modules/pacientes'`.
- Nao importe internals de outro modulo.
- Nao use `fetch` ou `axios` fora de `src/services/`.
- `shared/` nao pode importar `modules/`, `services/` ou `store/`.
- `pages/` nao deve conter regra de negocio.
- Use o alias `@/` para imports entre camadas.

## Validacao antes de entregar codigo

```bash
npm run lint
npm run build
```
