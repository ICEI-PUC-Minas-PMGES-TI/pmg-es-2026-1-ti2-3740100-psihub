## 5. Indicadores de desempenho

| **Indicador** | **Objetivos** | **Descrição** | **Fonte de dados** | **Fórmula de cálculo** |
| ---           | ---           | ---           | ---             | ---             |
| Percentual de pagamentos pagos | Avaliar a efetividade da cobrança das consultas | Percentual de pagamentos registrados como pagos em relação ao total de pagamentos do período | Tabela pagamentos | (número de pagamentos com status_pagamento = 'PAGO' / número total de pagamentos) * 100 |
| Nota média das consultas | Acompanhar a satisfação dos pacientes com os atendimentos realizados | Média das notas atribuídas pelos pacientes às consultas avaliadas | Tabelas avaliacoes e consultas | soma das notas das avaliações / número total de avaliações |
| Percentual de pacientes com retorno | Medir continuidade do acompanhamento terapêutico | Percentual de pacientes que realizaram mais de uma consulta com o psicólogo no período | Tabelas consultas, pacientes e psicologos | (número de pacientes com duas ou mais consultas concluídas / número total de pacientes com consulta concluída) * 100 |
| Consultas por mês dos pacientes | Acompanhar frequência de atendimento e demanda mensal dos pacientes | Quantidade de consultas realizadas por paciente em cada mês | Tabelas consultas e pacientes | número total de consultas do paciente no mês, agrupado por paciente_id e mês de inicio_em |
