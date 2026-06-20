# Mapa de Modulos Frontend

Este documento é operacional: use-o para entender rapidamente o que cada modulo exporta, consome e ainda carrega como divida técnica.

## Modulo: auth

| Item | Detalhe |
|---|---|
| Domínio | Entrada pública, login, cadastro, sessão autenticada e JWT/localStorage |
| Componentes | `AuthPage`, `LandingPage` |
| Hooks | `useAuthForm`, `useAuthSession` |
| Service | `src/services/auth.service.js` |
| Store | Nenhum |
| Exporta para | `pages/Auth`, `pages/Landing`, `App.jsx` |
| Consome | `services/auth.service.js`, `modules/auth/utils/auth.utils.js`, `lucide-react` |
| Barrel export | `src/modules/auth/index.js` |
| Dividas técnicas | `AuthPage` ainda concentra UI e estado de formulario; `LandingPage` ainda mistura landing pública e entrada de perfis |

## Modulo: pacientes

| Item | Detalhe |
|---|---|
| Domínio | Área do paciente, busca de psicólogos, agendamento, consultas, perfil e registros emocionais |
| Componentes | `PatientDashboard`, `PatientEmotionPage`, `PatientProfilePage` |
| Hooks | Nenhum nesta versão |
| Service | `src/services/scheduling.service.js`, `src/services/clinical.service.js` |
| Store | Nenhum |
| Exporta para | `pages/PatientDashboard`, `pages/PatientEmotion`, `pages/PatientProfile`, `App.jsx` |
| Consome | `services/scheduling.service.js`, `services/clinical.service.js`, `shared/utils/date.utils.js`, `lucide-react` |
| Barrel export | `src/modules/pacientes/index.js` |
| Dividas técnicas | `PatientDashboard` concentra fluxo de agenda, estado remoto e UI; `PatientEmotionPage` e `PatientProfilePage` ainda fazem orchestration de service no componente |

## Modulo: psicólogos

| Item | Detalhe |
|---|---|
| Domínio | Area do psicólogo, agenda, disponibilidade, pacientes, perfil profissional e relatórios |
| Componentes | `PsychologistAgendaPage`, `PsychologistDashboard`, `PatientsManagementPage`, `PsychologistProfilePage`, `ReportsPage`; `PsychologistDashboard2` privado/nao exportado |
| Hooks | `useAgenda` |
| Service | `src/services/scheduling.service.js`, `src/services/clinical.service.js` |
| Store | Nenhum |
| Exporta para | `pages/PsychologistAgenda`, `pages/PsychologistDashboard`, `pages/PatientsManagement`, `pages/PsychologistProfile`, `pages/Reports`, `App.jsx` |
| Consome | `services/scheduling.service.js`, `services/clinical.service.js`, `shared/utils/date.utils.js`, `lucide-react` |
| Barrel export | `src/modules/psicologos/index.js` |
| Dividas teénicas | `useAgenda` concentra regras e mutations; `PsychologistAgendaPage` contem muitos subcomponentes internos; dashboards ainda misturam disponibilidade, slots e consultas |

## Modulo: admin

| Item | Detalhe |
|---|---|
| Domínio | Gestao administrativa de acesso de psicólogos |
| Componentes | `AdminPsychologistsPage` |
| Hooks | Nenhum nesta versão |
| Service | `src/services/clinical.service.js` |
| Store | Nenhum |
| Exporta para | `pages/AdminPsychologists`, `App.jsx` |
| Consome | `services/clinical.service.js`, `lucide-react` |
| Barrel export | `src/modules/admin/index.js` |
| Dividas técnicas | Componente ainda faz orchestration de service e estado remoto diretamente |

## Area compartilhada

| Item | Detalhe |
|---|---|
| Componentes | `AppShell`, `Sidebar`, `TopBar`, `Toast` |
| Hooks | `useLocalStorage` |
| Utils | `date.utils.js` |
| Consome | React, lucide-react e APIs nativas do navegador |
| Restrição | Não pode importar `modules/`, `services/` ou `store/` |

## Services

| Service | Responsabilidade |
|---|---|
| `http.service.js` | Cliente HTTP base, token, query string, parse de envelope e erro padronizado |
| `auth.service.js` | Login e cadastro |
| `scheduling.service.js` | Psicólogos disponíveis, agenda, disponibilidade, consultas, slots e pacientes do psicólogo |
| `clinical.service.js` | Perfis, vínculos, registros emocionais, timeline e administração de acesso |
