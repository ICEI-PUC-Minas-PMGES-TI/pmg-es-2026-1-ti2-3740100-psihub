# psiHub


*Hugo Tavares Dutra, Hdutra@sga.pucminas.br*

*Gustavo Fitipaldi Moreira, gustavo.fitipaldi@sga.pucminas.br*

*Gabriel Eduardo de Oliveira Martins, 1473855@sga.pucminas.br*

*Yago Garzon Chaves, yago.chaves@sga.pucminas.br*

*Davi D'Assuncao Coelho, davi.assuncao@sga.pucminas.br*

---

Professores:

* Prof. Lucca Soares de Paiva Lacerda *

* Prof. Michelle Hanne Soares de Andrade 2 *

* Prof. Luiz Carlos *

---

Curso de Engenharia de Software, Unidade Coração Eucaristico

Instituto de Informática e Ciências Exatas – Pontifícia Universidade Católica de Minas Gerais (PUC MINAS), Belo Horizonte – MG – Brasil

---

O PsiHub surge no contexto da crescente demanda por cuidados em saúde mental, visando solucionar a fragmentação de dados e a gestão ineficiente em consultórios de psicologia. O objetivo do projeto é desenvolver uma plataforma digital centralizada que integra agendamento, prontuários eletrônicos e o monitoramento emocional contínuo do paciente entre as sessões. Como resultado relevante, o sistema estabelece um novo padrão de segurança através da conformidade rigorosa com a LGPD e o uso de criptografia, garantindo o sigilo terapêutico e proporcionando ao psicólogo uma visão analítica da evolução do paciente por meio de relatórios dinâmicos, tornando o tratamento mais preciso, organizado e humanizado.

---


## 1. Introdução

Este trabalho descreve o planejamento e o desenvolvimento de uma plataforma digital voltada para a gestão de atendimentos psicológicos, com foco em modernizar e otimizar a rotina de psicólogos e o acompanhamento de pacientes.

### 1.1 Contextualização

A saúde mental tem se tornado um tema cada vez mais relevante na sociedade atual, diante do aumento da busca por acompanhamento psicológico. Com rotinas cada vez mais aceleradas e maiores níveis de estresse, cresce a demanda por atendimentos mais organizados, acessíveis e contínuos. No entanto, muitos profissionais ainda utilizam métodos tradicionais para gerenciar agendas e registrar informações dos pacientes, o que pode dificultar o acompanhamento adequado da evolução clínica.

Diante desse cenário, a escolha do desenvolvimento de uma plataforma digital para psicólogos justifica-se pela necessidade de modernizar e centralizar a gestão dos atendimentos e do acompanhamento dos pacientes. A proposta de integrar recursos como agendamento de consultas, registros clínicos organizados em linha do tempo e acompanhamento emocional do paciente entre as sessões contribui para tornar o processo terapêutico mais eficiente, organizado e humanizado.

### 1.2 Problema

Em muitos contextos de atendimento psicológico, a organização das consultas, o registro de informações clínicas e o acompanhamento da evolução do paciente ainda são realizados por meio de ferramentas genéricas ou métodos manuais, como anotações em papel e planilhas. Esse modelo descentralizado dificulta a consolidação do histórico do paciente ao longo do tempo e pode tornar o processo de acompanhamento menos prático e eficiente.

Além disso, a ausência de um meio estruturado de registro entre as sessões faz com que informações relevantes sobre o cotidiano emocional do paciente dependam, em grande parte, de relatos pontuais durante as consultas. Esse formato limita a visão contínua do processo terapêutico e reduz as possibilidades de um acompanhamento mais próximo e orientado por dados ao longo do tratamento.

### 1.3 Objetivo geral

Desenvolver uma plataforma digital para psicólogos que auxilie na gestão de atendimentos e no acompanhamento contínuo dos pacientes, integrando recursos de agendamento de consultas, organização de registros clínicos e monitoramento do bem-estar do paciente entre as sessões, visando tornar o processo terapêutico mais organizado, eficiente e humanizado.

#### 1.3.1 Objetivos específicos

* Desenvolver um sistema de agendamento e cancelamento de consultas para pacientes.
* Criar um painel de gerenciamento para psicólogos, com controle de agenda e lista de pacientes.
* Implementar um espaço de anotações clínicas antes, durante e após as consultas.
* Desenvolver uma linha do tempo para organizar e visualizar a evolução do paciente ao longo do acompanhamento.

### 1.4 Justificativas

A criação de um sistema digital voltado para a gestão de atendimentos psicológicos justifica-se pela necessidade de centralizar e organizar informações clínicas, agenda de consultas e registros de evolução do paciente em um único ambiente. A utilização de ferramentas genéricas ou métodos manuais dificulta a visualização do histórico do paciente ao longo do tempo e torna o acompanhamento menos prático e integrado.

Além disso, a proposta de incluir recursos de acompanhamento emocional entre as sessões possibilita ao profissional obter informações mais contínuas sobre o estado do paciente, contribuindo para uma condução terapêutica mais direcionada e eficiente. Dessa forma, o sistema proposto surge como uma solução tecnológica que apoia o trabalho do psicólogo e melhora a experiência do paciente, promovendo um atendimento mais organizado, acessível e humanizado.

## 2. Participantes do Processo

O ecossistema do PsiHub é estruturado em torno de dois perfis centrais:

* **Psicólogo (Administrador Clínica):** Profissionais graduados (CRP ativo) que buscam migrar do registro analógico para o digital. Atuam na gestão da agenda, prontuários e análise de dados. Sua principal dor é a fragmentação de informações e o tempo gasto com burocracia.
* **Paciente (Usuário Final):** Pessoas de diversas faixas etárias em busca de suporte terapêutico. Utilizam a interface para agendamentos e, principalmente, para o registro de estados emocionais diários, servindo como a fonte primária de dados para o acompanhamento contínuo.

## 3. Modelagem do Processo de Negócio

### 3.1. Análise da Situação Atual

Atualmente, o fluxo de trabalho na maioria dos consultórios é fragmentado e vulnerável:
* **Agendamento:** Feito via ferramentas genéricas (WhatsApp/E-mail), gerando confusão de horários e mistura entre vida pessoal e profissional.
* **Registros:** Prontuários em papel ou arquivos soltos (Word/Excel), o que dificulta a busca histórica e compromete a segurança dos dados sensíveis.
* **O "Vácuo" Terapêutico:** Entre uma sessão e outra, o terapeuta perde o contato com a realidade emocional do paciente, dependendo apenas do relato verbal (muitas vezes impreciso) na consulta seguinte.

### 3.2. Descrição Geral da Proposta de Solução

O PsiHub elimina esses gargalos através de uma plataforma unificada que foca na **continuidade do cuidado**:

* **Centralização Operacional:** Agenda, prontuários eletrônicos e histórico financeiro em um único ambiente seguro e adequado à LGPD.
* **Monitoramento Inter-Sessões:** Ferramenta de registro emocional diário para o paciente, permitindo que o psicólogo visualize "picos" de ansiedade ou gatilhos antes mesmo da próxima consulta.
* **Evolução Orientada a Dados:** Transformação de anotações estáticas em relatórios dinâmicos. Isso permite uma visão analítica do progresso clínico, tornando o tratamento mais objetivo, seguro e focado no bem-estar real do paciente.

### 3.3. Modelagem dos processos

[PROCESSO 1 - Gestão do psicologo](processo-1-gestao-do-psicologo.md "Detalhamento do Processo 1.")

[PROCESSO 2 - Nome do Processo](processo-2-nome-do-processo.md "Detalhamento do Processo 2.")

[PROCESSO 3 - Nome do Processo](processo-3-nome-do-processo.md "Detalhamento do Processo 3.")

[PROCESSO 4 - Gestão financeira](processo-4-gestao-financeira.md "Detalhamento do Processo 4.")

[PROCESSO 5 - Nome do Processo](processo-5-nome-do-processo.md "Detalhamento do Processo 5.")

## 4. Projeto da solução

_O documento a seguir apresenta o detalhamento do projeto da solução. São apresentadas duas seções que descrevem, respectivamente: modelo relacional e tecnologias._

[Projeto da solução](solution-design.md "Detalhamento do projeto da solução: modelo relacional e tecnologias.")


## 5. Indicadores de desempenho

_O documento a seguir apresenta os indicadores de desempenho dos processos._

[Indicadores de desempenho dos processos](performance-indicators.md)


## 6. Interface do sistema

_A sessão a seguir apresenta a descrição do produto de software desenvolvido._ 

[Documentação da interface do sistema](interface.md)

## 7. Conclusão

_Apresente aqui a conclusão do seu trabalho. Deve ser apresentada aqui uma discussão dos resultados obtidos no trabalho, local em que se verifica as observações pessoais de cada aluno. Essa seção poderá também apresentar sugestões de novas linhas de estudo._

# REFERÊNCIAS

_Como um projeto de software não requer revisão bibliográfica, a inclusão das referências não é obrigatória. No entanto, caso você deseje incluir referências relacionadas às tecnologias, padrões, ou metodologias que serão usadas no seu trabalho, relacione-as de acordo com a ABNT._

_Verifique no link abaixo como devem ser as referências no padrão ABNT:_

http://portal.pucminas.br/imagedb/documento/DOC_DSC_NOME_ARQUI20160217102425.pdf

**[1.1]** - _ELMASRI, Ramez; NAVATHE, Sham. **Sistemas de banco de dados**. 7. ed. São Paulo: Pearson, c2019. E-book. ISBN 9788543025001._

**[1.2]** - _COPPIN, Ben. **Inteligência artificial**. Rio de Janeiro, RJ: LTC, c2010. E-book. ISBN 978-85-216-2936-8._

**[1.3]** - _CORMEN, Thomas H. et al. **Algoritmos: teoria e prática**. Rio de Janeiro, RJ: Elsevier, Campus, c2012. xvi, 926 p. ISBN 9788535236996._

**[1.4]** - _SUTHERLAND, Jeffrey Victor. **Scrum: a arte de fazer o dobro do trabalho na metade do tempo**. 2. ed. rev. São Paulo, SP: Leya, 2016. 236, [4] p. ISBN 9788544104514._

**[1.5]** - _RUSSELL, Stuart J.; NORVIG, Peter. **Inteligência artificial**. Rio de Janeiro: Elsevier, c2013. xxi, 988 p. ISBN 9788535237016._



# APÊNDICES


_Atualizar os links e adicionar novos links para que a estrutura do código esteja corretamente documentada._


## Apêndice A - Código fonte

[Código do front-end](../src/front) -- repositório do código do front-end

[Código do back-end](../src/back)  -- repositório do código do back-end


## Apêndice B - Apresentação final


[Slides da apresentação final](presentations/)


[Vídeo da apresentação final](video/)






