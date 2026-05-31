CREATE TABLE avaliacoes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    consulta_id BIGINT NOT NULL,
    paciente_id BIGINT NOT NULL,
    psicologo_id BIGINT NOT NULL,
    nota TINYINT NOT NULL,
    comentario VARCHAR(300),
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_avaliacoes PRIMARY KEY (id),
    CONSTRAINT uk_avaliacoes_consulta UNIQUE (consulta_id),
    CONSTRAINT fk_avaliacoes_consulta FOREIGN KEY (consulta_id) REFERENCES consultas (id),
    CONSTRAINT fk_avaliacoes_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id),
    CONSTRAINT fk_avaliacoes_psicologo FOREIGN KEY (psicologo_id) REFERENCES psicologos (id),
    CONSTRAINT ck_avaliacoes_nota CHECK (nota BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
