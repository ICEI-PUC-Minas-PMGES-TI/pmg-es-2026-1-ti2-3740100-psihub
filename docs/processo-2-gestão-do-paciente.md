### 3.3.2 Processo 2 – Gestão do Paciente

Este processo descreve todas as interações realizadas pelo paciente dentro da plataforma PsiHub. Ele contempla desde o cadastro e autenticação até o registro emocional contínuo, agendamento de consultas e acompanhamento do próprio histórico terapêutico.

A principal oportunidade de melhoria está na centralização dessas ações em um único ambiente digital, permitindo que o paciente tenha maior autonomia no acompanhamento da sua saúde mental, além de fornecer dados contínuos ao psicólogo, reduzindo a dependência de relatos pontuais em sessão.

![Modelo BPMN do Processo 2 – Gestão do Paciente](images/gestao-do-paciente.png)

---

#### Detalhamento das atividades

---

### **Atividade 1 – Cadastro do Paciente**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Nome completo | Caixa de Texto | Obrigatório; máximo 100 caracteres | — |
| Data de nascimento | Data | Obrigatório; formato dd-mm-aaaa | — |
| E-mail | Caixa de Texto | Formato de e-mail válido; obrigatório | — |
| Senha | Caixa de Texto | Mínimo de 8 caracteres; obrigatório | — |
| Confirmar senha | Caixa de Texto | Deve ser igual à senha | — |
| Telefone | Caixa de Texto | Formato (DD) 9XXXX-XXXX | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Cadastrar | Atividade 2 – Realizar Login | default |
| Cancelar | Fim do processo | cancel |

---

### **Atividade 2 – Realizar Login**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| E-mail | Caixa de Texto | Obrigatório; formato válido | — |
| Senha | Caixa de Texto | Obrigatório; mínimo 8 caracteres | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Entrar | Atividade 3 – Acessar Dashboard do Paciente | default |
| Esqueci minha senha | Recuperação de senha via e-mail | — |
| Voltar | Cadastro | cancel |

---

### **Atividade 3 – Acessar Dashboard do Paciente**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Próximas consultas | Tabela | Somente leitura | — |
| Humor recente | Número | Escala de 1 a 5 | — |
| Notificações | Tabela | Somente leitura | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Registrar humor | Atividade 4 – Registrar Estado Emocional | — |
| Agendar consulta | Atividade 5 – Agendar Consulta | — |
| Ver histórico | Atividade 6 – Visualizar Histórico | — |
| Editar perfil | Atividade 7 – Editar Perfil | — |
| Sair | Fim do processo | cancel |

---

### **Atividade 4 – Registrar Estado Emocional**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Humor do dia | Número | Escala de 1 a 5; obrigatório | — |
| Emoções sentidas | Seleção múltipla | Ansiedade, Tristeza, Felicidade, Raiva, etc. | — |
| Descrição | Área de Texto | Máx. 500 caracteres | — |
| Data e hora | Data e Hora | Gerado automaticamente | atual |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Salvar | Dashboard do Paciente | default |
| Cancelar | Dashboard do Paciente | cancel |

---

### **Atividade 5 – Agendar Consulta**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Psicólogo | Seleção única | Lista de profissionais disponíveis | — |
| Data | Data | Não pode ser passada | — |
| Horário | Hora | Conforme disponibilidade | — |
| Tipo de atendimento | Seleção única | Online / Presencial | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Confirmar agendamento | Dashboard do Paciente | default |
| Cancelar | Dashboard do Paciente | cancel |

---

### **Atividade 6 – Visualizar Histórico**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Histórico de consultas | Tabela | Somente leitura | — |
| Registros emocionais | Tabela | Somente leitura | — |
| Gráfico de evolução emocional | Imagem | Gerado automaticamente | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Voltar | Dashboard do Paciente | cancel |

---

### **Atividade 7 – Editar Perfil**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Nome | Caixa de Texto | Obrigatório | — |
| Telefone | Caixa de Texto | Formato válido | — |
| Foto de perfil | Imagem | JPG/PNG até 5MB | — |
| Senha | Caixa de Texto | Opcional; mínimo 8 caracteres | — |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Salvar | Dashboard do Paciente | default |
| Cancelar | Dashboard do Paciente | cancel |

---

### Regras de Negócio

- O paciente só pode acessar seus próprios dados.
- Todos os registros emocionais são privados e visíveis apenas para o psicólogo vinculado.
- O sistema deve seguir as diretrizes da LGPD, garantindo criptografia e segurança dos dados.
- Não é permitido agendamento em horários indisponíveis.
- Registros emocionais não podem ser editados após 24h (garantia de integridade dos dados).

---