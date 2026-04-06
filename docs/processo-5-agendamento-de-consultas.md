### 3.3.5 Processo 5 – Agendamento de Consulta

Este processo descreve o fluxo de agendamento de consultas psicológicas na plataforma PsiHub, realizado pelo paciente. O objetivo é permitir que o usuário visualize a disponibilidade do psicólogo e selecione um horário adequado de forma simples e organizada.

O processo se inicia com o acesso do paciente à funcionalidade de agendamento, onde ele pode buscar um psicólogo e visualizar sua agenda. Em seguida, o paciente seleciona uma data e horário disponíveis, confirma as informações da consulta e finaliza o agendamento. Após a confirmação, o sistema registra a consulta e atualiza automaticamente a agenda do psicólogo.

Uma melhoria importante em relação a modelos tradicionais é a automatização do processo, eliminando a necessidade de contato manual (como mensagens ou ligações), reduzindo erros e conflitos de horário.

![Modelo BPMN do Processo 5 – Agendamento de Consulta](images/agendamento-de-consulta.svg "Modelo BPMN do Processo 5.")

---

#### Detalhamento das atividades

---

**Atividade 1 – Acessar Agendamento**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Lista de psicólogos | Tabela | Exibe nome, especialidade e avaliação | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Selecionar psicólogo | Atividade 2 – Visualizar Agenda | default |
| Voltar | Tela inicial | cancel |

---

**Atividade 2 – Visualizar Agenda**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Agenda do psicólogo | Calendário | Somente leitura; exibe horários disponíveis e indisponíveis | — |
| Data selecionada | Data | Deve ser futura | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Selecionar horário | Atividade 3 – Confirmar Consulta | default |
| Alterar data | Atualiza agenda exibida | — |
| Voltar | Atividade 1 – Acessar Agendamento | cancel |

---

**Atividade 3 – Confirmar Consulta**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Nome do paciente | Caixa de Texto | Preenchido automaticamente; obrigatório | — |
| Psicólogo selecionado | Caixa de Texto | Somente leitura | — |
| Data e horário | Caixa de Texto | Somente leitura | — |
| Tipo de consulta | Seleção única | Online ou Presencial | Online |
| Observações | Área de Texto | Opcional; máximo de 300 caracteres | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Confirmar agendamento | Atividade 4 – Registrar Consulta | default |
| Cancelar | Atividade 2 – Visualizar Agenda | cancel |

---

**Atividade 4 – Registrar Consulta**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Dados da consulta | Registro interno | Deve conter paciente, psicólogo, data e horário | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Finalizar | Atividade 5 – Exibir Confirmação | default |


---

**Atividade 5 – Exibir Confirmação**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Mensagem de confirmação | Texto | Exibe sucesso no agendamento | — |
| Detalhes da consulta | Texto | Data, horário e psicólogo | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Voltar ao início | Tela inicial | default |

---
