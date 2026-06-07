-- Reverts V4: the psicologo_id column is not part of the domain model.
-- Emotional records are visible to ALL psychologists with an accepted link,
-- not directed to a specific one.
DROP INDEX IF EXISTS idx_registros_psicologo ON registros_emocionais;

ALTER TABLE registros_emocionais
    DROP FOREIGN KEY fk_registros_emocionais_psicologos,
    DROP COLUMN psicologo_id;
