# Mapa de Modulos Frontend

## Modulo: auth

| Item | Detalhe |
|---|---|
| Dominio | Entrada publica, login, cadastro e sessao autenticada |
| Componentes | `AuthPage`, `LandingPage` |
| Hooks | `useAuthForm`, `useAuthSession` |
| Service | `src/services/auth.service.js` |
| Store | Nenhum |
| Exporta para | `pages/Auth`, `pages/Landing`, `App.jsx` |
| Consome | `services/auth.service.js`, `modules/auth/utils/auth.utils.js`, `lucide-react` |
| Barrel export | `src/modules/auth/index.js` |
| Dividas tecnicas | `LandingPage` ainda mistura landing publica com entrada de perfis |

## Modulo: pacientes

| Item | Detalhe |
|---|---|
| Dominio | Area do paciente, busca de psicologos, agendamento e consultas |
| Componentes | `PatientDashboard` |
| Hooks | Nenhum nesta versao |
| Service | `src/services/scheduling.service.js` |
| Store | Nenhum |
| Exporta para | `pages/PatientDashboard`, `App.jsx` |
| Consome | `services/scheduling.service.js`, `shared/utils/date.utils.js`, `lucide-react` |
| Barrel export | `src/modules/pacientes/index.js` |
| Dividas tecnicas | `PatientDashboard` concentra fluxo, estado, efeitos e UI |

## Modulo: psicologos

| Item | Detalhe |
|---|---|
| Dominio | Area do psicologo, agenda, disponibilidade e dashboard clinico |
| Componentes | `PsychologistAgendaPage`, `PsychologistDashboard`; `PsychologistDashboard2` privado/nao exportado |
| Hooks | Nenhum nesta versao |
| Service | `src/services/scheduling.service.js` |
| Store | Nenhum |
| Exporta para | `pages/PsychologistAgenda`, `pages/PsychologistDashboard`, `App.jsx` |
| Consome | `services/scheduling.service.js`, `shared/utils/date.utils.js`, `lucide-react` |
| Barrel export | `src/modules/psicologos/index.js` |
| Dividas tecnicas | Componentes grandes ainda misturam regra, API, estado e renderizacao |

## Area Compartilhada

| Item | Detalhe |
|---|---|
| Componentes | `AppShell`, `Sidebar`, `TopBar`, `Toast` |
| Hooks | `useLocalStorage` |
| Utils | `date.utils.js` |
| Consome | React, lucide-react e APIs nativas do navegador |
| Restricao | Nao pode importar `modules/` nem `services/` |

## Services

| Service | Responsabilidade |
|---|---|
| `http.service.js` | Cliente HTTP base, token e envelope de resposta |
| `auth.service.js` | Login e cadastro |
| `scheduling.service.js` | Agenda, consultas, disponibilidade, pacientes e psicologos |
