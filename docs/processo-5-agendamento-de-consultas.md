### 3.3.5 Processo 5 – Agendamento de Consulta 

Este processo descreve o fluxo de agendamento de consultas psicológicas na plataforma PsiHub, envolvendo tanto o paciente quanto o psicólogo. O objetivo é permitir que o paciente visualize horários disponíveis e realize o agendamento, enquanto o psicólogo mantém sua agenda atualizada.

O processo se inicia com o psicólogo definindo sua disponibilidade de horários. Em seguida, o paciente acessa a funcionalidade de agendamento, escolhe um psicólogo, visualiza a agenda e seleciona um horário disponível. Após a confirmação, o sistema registra a consulta e atualiza automaticamente a agenda.

Uma melhoria importante em relação a modelos tradicionais é a automatização do processo, eliminando a necessidade de contato manual (como mensagens ou ligações), reduzindo erros e conflitos de horário.
![Modelo BPMN do Processo 5 – Agendamento de Consulta](images/agendamento-de-consulta.svg "Modelo BPMN do Processo 5.")

---

#### Detalhamento das atividades

---

### **Atividades do Psicólogo**

---

**Atividade 1 – Definir Disponibilidade**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Dias disponíveis | Seleção múltipla | Pelo menos 1 dia selecionado | — |
| Horário de início | Hora | Obrigatório | — |
| Horário de fim | Hora | Deve ser posterior ao início | — |
| Duração da consulta | Número | Em minutos; obrigatório | 50 |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Salvar horários | Agenda atualizada no sistema | default |
| Cancelar | Retorna sem salvar | cancel |

---

**Atividade 2 – Gerenciar Agenda**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Lista de horários | Tabela | Exibe horários disponíveis e ocupados | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Adicionar horário | Inclui novo horário disponível | default |
| Remover horário | Remove horário disponível | cancel |

---

### **Atividades do Paciente**

---

**Atividade 3 – Acessar Agendamento**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Lista de psicólogos | Tabela | Exibe nome, especialidade e avaliação | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Selecionar psicólogo | Atividade 4 – Visualizar Agenda | default |
| Voltar | Tela inicial | cancel |

---

**Atividade 4 – Visualizar Agenda**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Agenda do psicólogo | Calendário | Somente leitura; exibe horários disponíveis e indisponíveis | — |
| Data selecionada | Data | Deve ser futura | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Selecionar horário | Atividade 5 – Confirmar Consulta | default |
| Alterar data | Atualiza agenda exibida | — |
| Voltar | Atividade 3 – Acessar Agendamento | cancel |

---

**Atividade 5 – Confirmar Consulta**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Nome do paciente | Caixa de Texto | Preenchido automaticamente; obrigatório | — |
| Psicólogo selecionado | Caixa de Texto | Somente leitura | — |
| Data e horário | Caixa de Texto | Somente leitura | — |
| Tipo de consulta | Seleção única | Online ou Presencial | Online |
| Observações | Área de Texto | Opcional; máximo de 300 caracteres | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Confirmar agendamento | Atividade 6 – Registrar Consulta | default |
| Cancelar | Atividade 4 – Visualizar Agenda | cancel |

---


**Atividade 6 – Registrar Consulta**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Dados da consulta | Registro interno | Deve conter paciente, psicólogo, data e horário | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Finalizar | Atividade 7 – Exibir Confirmação | default |


---

**Atividade 7 – Exibir Confirmação**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Mensagem de confirmação | Texto | Exibe sucesso no agendamento | — |
| Detalhes da consulta | Texto | Data, horário e psicólogo | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Voltar ao início | Tela inicial | default |

---

**Atividade 8 - Cancelar consulta**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Lista de consultas agendadas | Tabela | Exibe data, horário, psicólogo e status | — |
| Motivo do cancelamento | Área de Texto | Opcional; máximo de 300 caracteres | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Cancelar consulta | Atualiza status da consulta para "Cancelada" | default |
| Voltar | Retorna à tela anterior | cancel |

> **Regra de negócio:** Ao cancelar uma consulta, o horário deve ser automaticamente liberado novamente na agenda do psicólogo.

> **Regra de negócio:** O sistema deve notificar o psicólogo sobre o cancelamento da consulta.

