### 3.3.2 Processo 2 – Gestão do Paciente

Este processo descreve todas as interações realizadas pelo paciente dentro da plataforma PsiHub. Ele contempla desde o cadastro e autenticação até o registro emocional contínuo, agendamento de consultas e acompanhamento do próprio histórico terapêutico.
A principal oportunidade de melhoria está na centralização dessas ações em um único ambiente digital, permitindo que o paciente tenha maior autonomia no acompanhamento da sua saúde mental, além de fornecer dados contínuos ao psicólogo, reduzindo a dependência de relatos pontuais em sessão.


new
<img width="1205" height="1170" alt="image" src="https://github.com/user-attachments/assets/c010b3c7-7fb9-431c-95ab-0917f40464e5" />

old
![Modelo BPMN do Processo 2 – Gestão do Paciente](images/gestao-do-paciente.png)

---

#### Detalhamento das atividades

---

### **Atividade 1 – Cadastro do Paciente**
O paciente acessa a plataforma e preenche o formulário de cadastro com seus dados pessoais. O sistema valida os dados informados; caso haja inconsistência, uma mensagem de erro de validação é exibida e o paciente pode corrigir e tentar novamente.

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
Após o cadastro ou em acessos posteriores, o paciente informa suas credenciais. O sistema verifica os dados; caso inválidos, exibe uma mensagem de erro e permite nova tentativa no mesmo fluxo.

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
Autenticado com sucesso, o paciente acessa o painel do paciente, que exibe as próximas consultas agendadas, o humor recente registrado e notificações pendentes. A partir daqui o paciente pode acessar todas as funcionalidades do sistema.

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
O paciente acessa a opção Registrar humor e preenche as informações do estado emocional do dia. O sistema verifica a restrição de 24h: caso o registro já tenha sido criado há mais de 24 horas, a edição é bloqueada para garantir a integridade dos dados.

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
O paciente seleciona o psicólogo desejado, a data e o horário pretendidos. O sistema verifica a disponibilidade do horário: caso indisponível, exibe aviso e solicita nova escolha. Caso disponível, o paciente confirma o agendamento

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
O paciente acessa o histórico completo, que exibe o histórico de consultas realizadas, os registros emocionais anteriores e o gráfico de evolução emocional gerado automaticamente.

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
