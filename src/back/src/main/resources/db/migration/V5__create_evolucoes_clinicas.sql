CREATE TABLE evolucoes_clinicas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    psicologo_id BIGINT NOT NULL,
    titulo VARCHAR(500),
    temas_sessao LONGTEXT,
    anotacoes_clinicas LONGTEXT NOT NULL,
    nivel_engajamento VARCHAR(10),
    nivel_progresso INT,
    intercorrencias VARCHAR(1000),
    tarefas_encaminhamentos LONGTEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_evolucao_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_evolucao_psicologo FOREIGN KEY (psicologo_id) REFERENCES psicologos(id) ON DELETE CASCADE,
    INDEX idx_evolucao_paciente_ativo (paciente_id, ativo),
    INDEX idx_evolucao_criado_em (criado_em)
);

