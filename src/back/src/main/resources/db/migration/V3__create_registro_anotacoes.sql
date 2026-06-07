CREATE TABLE registros_anotacoes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    registro_emocional_id BIGINT NOT NULL,
    psicologo_id BIGINT NOT NULL,
    texto TEXT,
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_registros_anotacoes PRIMARY KEY (id),
    CONSTRAINT fk_registros_anotacoes_registros FOREIGN KEY (registro_emocional_id) REFERENCES registros_emocionais (id) ON DELETE RESTRICT,
    CONSTRAINT fk_registros_anotacoes_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_registros_anotacoes_registro ON registros_anotacoes (registro_emocional_id);

