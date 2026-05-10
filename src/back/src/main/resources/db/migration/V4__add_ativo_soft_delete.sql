-- Soft-delete global: adiciona coluna ativo a todas as tabelas de entidade
-- que ainda nao possuem a coluna. Registros existentes recebem ativo = true (DEFAULT).

ALTER TABLE consultas                ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE slots_consulta           ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE psicologos               ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE pacientes                ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE especialidades_psicologo ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE vinculo_psicologo_paciente ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE excecoes_disponibilidade ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE notificacoes             ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE prontuarios_sessao       ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE registros_emocionais     ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE pagamentos               ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
ALTER TABLE recibos                  ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
