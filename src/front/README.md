# PsiHub Frontend

Aplicacao React/Vite do PsiHub para autenticacao, area do paciente, area do psicologo, agenda e consultas.

## Requisitos

- Node.js 22 recomendado
- npm
- Backend PsiHub disponivel localmente ou em uma URL configurada

## Instalacao

```bash
npm install
```

## Como Rodar

```bash
npm run dev
```

Por padrao, o Vite sobe em `http://localhost:5173` e encaminha chamadas `/api` para `http://localhost:8080`.

Para alterar o backend usado pelo proxy:

```bash
VITE_BACKEND_PROXY_TARGET=http://localhost:8081 npm run dev
```

No PowerShell:

```powershell
$env:VITE_BACKEND_PROXY_TARGET="http://localhost:8081"; npm run dev
```

Se quiser chamar uma API absoluta sem proxy, configure:

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

## Scripts

| Comando | Finalidade |
|---|---|
| `npm run dev` | Inicia o servidor Vite |
| `npm run build` | Gera build de producao |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | Executa ESLint |

## Estrutura

```text
src/
  pages/      montagem de telas, sem regra de negocio
  modules/    dominios de negocio do frontend
  shared/     componentes, hooks e utils reutilizaveis
  services/   chamadas HTTP e cliente de API
  store/      reservado para estado global futuro
  assets/     estilos globais, imagens e icones estaticos
```

## Regra Principal

Use sempre a hierarquia:

```text
pages -> modules -> shared / services / store
```

`shared/` nao pode importar `modules/` nem `services/`. Componentes nao devem chamar `fetch` diretamente; chamadas HTTP ficam em `services/`.

## Documentacao

- `ARCHITECTURE.md`: principios e regras da arquitetura
- `CONTRIBUTING.md`: como adicionar features sem quebrar a estrutura
- `MODULE_MAP.md`: mapa operacional dos modulos atuais
