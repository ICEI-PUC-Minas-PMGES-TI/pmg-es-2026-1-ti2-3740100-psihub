-- Reverts V4: the psicologo_id column is not part of the domain model.
-- Emotional records are visible to ALL psychologists with an accepted link,
-- not directed to a specific one.
ALTER TABLE registros_emocionais
    DROP FOREIGN KEY fk_registros_emocionais_psicologos,
    DROP INDEX idx_registros_psicologo,
    DROP COLUMN psicologo_id;
