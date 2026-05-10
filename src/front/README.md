# PsiHub Frontend

Aplicacao React para autenticacao e agendamento de consultas do PsiHub.

## Requisitos

- Node.js 22 ou superior
- Backend PsiHub executando em `http://localhost:8080`

## Executar

```bash
npm install
npm run dev
```

O Vite abre o front em `http://localhost:5173` e encaminha chamadas `/api` para o backend.

Para apontar o proxy para outra porta:

```bash
VITE_BACKEND_PROXY_TARGET=http://localhost:8081 npm run dev
```

No PowerShell:

```powershell
$env:VITE_BACKEND_PROXY_TARGET="http://localhost:8081"; npm run dev
```

Para build estatico:

```bash
npm run build
```

## Fluxos

- Login e cadastro com JWT.
- Redirecionamento automatico por tipo de usuario.
- Psicologo: definir disponibilidade e gerenciar agenda.
- Paciente: buscar psicologo, selecionar horario, confirmar consulta e cancelar consultas agendadas.

## APIs consumidas

- `POST /auth/register`
- `POST /auth/login`
- `GET /api/psicologos/disponiveis`
- `GET /api/psicologos/me/agenda/slots`
- `POST /api/psicologos/me/disponibilidades`
- `POST /api/psicologos/me/agenda/slots`
- `PATCH /api/psicologos/me/agenda/slots/{slotId}/cancelar`
- `GET /api/psicologos/{psicologoId}/agenda/slots/disponiveis`
- `POST /api/consultas/agendamentos`
- `GET /api/consultas`
- `PATCH /api/consultas/{consultaId}/cancelar`
