CREATE TABLE notificacoes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    titulo VARCHAR(120) NOT NULL,
    mensagem VARCHAR(500) NOT NULL,
    lida BIT(1) NOT NULL DEFAULT b'0',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_notificacoes PRIMARY KEY (id),
    CONSTRAINT fk_notificacoes_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notificacoes_usuario_lida ON notificacoes (usuario_id, lida, criado_em);
