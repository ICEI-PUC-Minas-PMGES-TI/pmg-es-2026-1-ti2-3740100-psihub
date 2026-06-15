# PsiHub Frontend

Frontend React/Vite do PsiHub. A aplicação atende os fluxos de autenticação, area do paciente, area do psicólogo, agenda de consultas, registros emocionais, relatorios e administração de acesso de psicólogos.

## Pre-requisitos

- Node.js 22 ou versão compativel com Vite 6
- npm
- Backend PsiHub rodando localmente ou URL remota configurada

## Instalação

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
| `npm run build` | Gera build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | Executa ESLint |

## Estrutura de pastas

```text
src/
  pages/      wrappers de rota; montam modulos e repassam props
  modules/    codigo por dominio de negocio
  shared/     componentes, hooks e utils sem regra de dominio
  services/   toda comunicação HTTP
  store/      reservado para estado global futuro
  assets/     estilos globais, imagens e icones estaticos
```

## Regras essenciais

- Importe dominios por barrel: `import { PatientDashboard } from '@/modules/pacientes'`.
- Não importe internals de outro modulo.
- Não use `fetch` ou `axios` fora de `src/services/`.
- `shared/` não pode importar `modules/`, `services/` ou `store/`.
- `pages/` não deve conter regra de negocio.
- Use o alias `@/` para imports entre camadas.

## Validação antes de entregar codigo

```bash
npm run lint
npm run build
```
