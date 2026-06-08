ALTER TABLE registros_emocionais
    ADD COLUMN psicologo_id BIGINT NULL,
    ADD CONSTRAINT fk_registros_emocionais_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE SET NULL;

CREATE INDEX idx_registros_psicologo ON registros_emocionais (psicologo_id);

