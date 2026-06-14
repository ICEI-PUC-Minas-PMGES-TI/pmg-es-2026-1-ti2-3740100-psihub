CREATE TABLE usuarios (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(30),
    foto_url VARCHAR(500),
    tipo_usuario VARCHAR(20) NOT NULL,
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    CONSTRAINT ck_usuarios_tipo CHECK (tipo_usuario IN ('PACIENTE', 'PSICOLOGO', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE psicologos (
    id BIGINT NOT NULL,
    crp VARCHAR(30) NOT NULL,
    biografia VARCHAR(500),
    valor_consulta DECIMAL(10, 2) NOT NULL,
    status_acesso VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    motivo_revogacao VARCHAR(300),
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_psicologos PRIMARY KEY (id),
    CONSTRAINT uk_psicologos_crp UNIQUE (crp),
    CONSTRAINT fk_psicologos_usuarios FOREIGN KEY (id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT ck_psicologos_valor CHECK (valor_consulta >= 0),
    CONSTRAINT ck_psicologos_status CHECK (status_acesso IN ('PENDENTE', 'ATIVO', 'REVOGADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pacientes (
    id BIGINT NOT NULL,
    data_nascimento DATE NOT NULL,
    observacoes_iniciais VARCHAR(300),
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_pacientes PRIMARY KEY (id),
    CONSTRAINT fk_pacientes_usuarios FOREIGN KEY (id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE especialidades_psicologo (
    id BIGINT NOT NULL AUTO_INCREMENT,
    psicologo_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_especialidades_psicologo PRIMARY KEY (id),
    CONSTRAINT fk_especialidades_psicologo_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT uk_especialidades_psicologo_nome UNIQUE (psicologo_id, nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vinculo_psicologo_paciente (
    id BIGINT NOT NULL AUTO_INCREMENT,
    paciente_id BIGINT NOT NULL,
    psicologo_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SOLICITADO',
    solicitado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    respondido_em DATETIME(6),
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_vinculo_psicologo_paciente PRIMARY KEY (id),
    CONSTRAINT fk_vinculo_pacientes FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_vinculo_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT uk_vinculo_paciente_psicologo UNIQUE (paciente_id, psicologo_id),
    CONSTRAINT ck_vinculo_status CHECK (status IN ('SOLICITADO', 'ACEITO', 'RECUSADO', 'ENCERRADO')),
    CONSTRAINT ck_vinculo_resposta CHECK (
        (status = 'SOLICITADO' AND respondido_em IS NULL)
        OR (status <> 'SOLICITADO' AND respondido_em IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE regras_disponibilidade (
    id BIGINT NOT NULL AUTO_INCREMENT,
    psicologo_id BIGINT NOT NULL,
    dia_semana VARCHAR(10) NOT NULL,
    valido_a_partir_de DATE NOT NULL,
    valido_ate DATE,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    pausa_inicio TIME,
    pausa_fim TIME,
    duracao_slot_minutos INT NOT NULL,
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_regras_disponibilidade PRIMARY KEY (id),
    CONSTRAINT fk_regras_disponibilidade_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT ck_regras_dia CHECK (dia_semana IN ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO')),
    CONSTRAINT ck_regras_vigencia CHECK (valido_ate IS NULL OR valido_ate >= valido_a_partir_de),
    CONSTRAINT ck_regras_horario CHECK (hora_fim > hora_inicio),
    CONSTRAINT ck_regras_pausa CHECK (
        (pausa_inicio IS NULL AND pausa_fim IS NULL)
        OR (
            pausa_inicio IS NOT NULL
            AND pausa_fim IS NOT NULL
            AND pausa_fim > pausa_inicio
            AND pausa_inicio >= hora_inicio
            AND pausa_fim <= hora_fim
        )
    ),
    CONSTRAINT ck_regras_duracao CHECK (duracao_slot_minutos > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE excecoes_disponibilidade (
    id BIGINT NOT NULL AUTO_INCREMENT,
    psicologo_id BIGINT NOT NULL,
    data DATE NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    motivo VARCHAR(300),
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_excecoes_disponibilidade PRIMARY KEY (id),
    CONSTRAINT fk_excecoes_disponibilidade_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT ck_excecoes_tipo CHECK (tipo IN ('FOLGA', 'BLOQUEIO', 'JANELA_EXTRA')),
    CONSTRAINT ck_excecoes_horario CHECK (
        (tipo = 'FOLGA' AND hora_inicio IS NULL AND hora_fim IS NULL)
        OR (tipo IN ('BLOQUEIO', 'JANELA_EXTRA') AND hora_inicio IS NOT NULL AND hora_fim IS NOT NULL AND hora_fim > hora_inicio)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE consultas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    paciente_id BIGINT NOT NULL,
    psicologo_id BIGINT NOT NULL,
    vinculo_id BIGINT,
    inicio_em DATETIME(6) NOT NULL,
    fim_em DATETIME(6) NOT NULL,
    inicio_mes DATE GENERATED ALWAYS AS (
        DATE_SUB(DATE(inicio_em), INTERVAL (DAYOFMONTH(inicio_em) - 1) DAY)
    ) STORED,
    agendado_por_usuario_id BIGINT NOT NULL,
    iniciado_em DATETIME(6),
    finalizado_em DATETIME(6),
    tipo_atendimento VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    status VARCHAR(20) NOT NULL DEFAULT 'AGENDADA',
    observacoes VARCHAR(300),
    motivo_cancelamento VARCHAR(300),
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_consultas PRIMARY KEY (id),
    CONSTRAINT fk_consultas_pacientes FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_consultas_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_consultas_vinculos FOREIGN KEY (vinculo_id) REFERENCES vinculo_psicologo_paciente (id) ON DELETE RESTRICT,
    CONSTRAINT fk_consultas_agendado_por FOREIGN KEY (agendado_por_usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT,
    CONSTRAINT ck_consultas_tipo CHECK (tipo_atendimento IN ('ONLINE', 'PRESENCIAL')),
    CONSTRAINT ck_consultas_status CHECK (status IN ('AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'FALTOU')),
    CONSTRAINT ck_consultas_agendamento_periodo CHECK (fim_em > inicio_em),
    CONSTRAINT ck_consultas_sessao_periodo CHECK (iniciado_em IS NULL OR finalizado_em IS NULL OR finalizado_em > iniciado_em),
    CONSTRAINT ck_consultas_conclusao CHECK (
        status <> 'CONCLUIDA'
        OR (iniciado_em IS NOT NULL AND finalizado_em IS NOT NULL AND finalizado_em > iniciado_em)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prontuarios_sessao (
    id BIGINT NOT NULL AUTO_INCREMENT,
    consulta_id BIGINT NOT NULL,
    observacoes_pre_sessao TEXT,
    anotacoes_clinicas TEXT,
    intercorrencias VARCHAR(1000),
    evolucao_clinica TEXT,
    tarefas_encaminhamentos VARCHAR(1000),
    nivel_engajamento VARCHAR(10),
    nivel_progresso INT,
    incluir_linha_tempo BIT(1) NOT NULL DEFAULT b'1',
    temas_sessao TEXT,
    intervencoes TEXT,
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_prontuarios_sessao PRIMARY KEY (id),
    CONSTRAINT fk_prontuarios_sessao_consultas FOREIGN KEY (consulta_id) REFERENCES consultas (id) ON DELETE RESTRICT,
    CONSTRAINT uk_prontuarios_sessao_consulta UNIQUE (consulta_id),
    CONSTRAINT ck_prontuarios_engajamento CHECK (nivel_engajamento IS NULL OR nivel_engajamento IN ('BAIXO', 'MEDIO', 'ALTO')),
    CONSTRAINT ck_prontuarios_progresso CHECK (nivel_progresso IS NULL OR nivel_progresso BETWEEN 1 AND 10),
    CONSTRAINT ck_prontuarios_temas_json CHECK (temas_sessao IS NULL OR JSON_VALID(temas_sessao)),
    CONSTRAINT ck_prontuarios_intervencoes_json CHECK (intervencoes IS NULL OR JSON_VALID(intervencoes))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registros_emocionais (
    id BIGINT NOT NULL AUTO_INCREMENT,
    paciente_id BIGINT NOT NULL,
    humor_dia INT NOT NULL,
    descricao VARCHAR(500),
    emocoes TEXT,
    registrado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    editavel_ate DATETIME(6) NOT NULL,
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_registros_emocionais PRIMARY KEY (id),
    CONSTRAINT fk_registros_emocionais_pacientes FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE RESTRICT,
    CONSTRAINT ck_registros_humor CHECK (humor_dia BETWEEN 1 AND 5),
    CONSTRAINT ck_registros_editavel CHECK (editavel_ate >= registrado_em),
    CONSTRAINT ck_registros_emocoes_json CHECK (emocoes IS NULL OR JSON_VALID(emocoes))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registros_anotacoes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    registro_emocional_id BIGINT NOT NULL,
    psicologo_id BIGINT NOT NULL,
    vinculo_id BIGINT,
    texto TEXT,
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_registros_anotacoes PRIMARY KEY (id),
    CONSTRAINT fk_registros_anotacoes_registros FOREIGN KEY (registro_emocional_id) REFERENCES registros_emocionais (id) ON DELETE RESTRICT,
    CONSTRAINT fk_registros_anotacoes_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_registros_anotacoes_vinculos FOREIGN KEY (vinculo_id) REFERENCES vinculo_psicologo_paciente (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pagamentos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    consulta_id BIGINT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    forma_pagamento VARCHAR(20) NOT NULL,
    status_pagamento VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    pago_em DATETIME(6),
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_pagamentos PRIMARY KEY (id),
    CONSTRAINT fk_pagamentos_consultas FOREIGN KEY (consulta_id) REFERENCES consultas (id) ON DELETE RESTRICT,
    CONSTRAINT uk_pagamentos_consulta UNIQUE (consulta_id),
    CONSTRAINT ck_pagamentos_valor CHECK (valor > 0),
    CONSTRAINT ck_pagamentos_forma CHECK (forma_pagamento IN ('PIX', 'CARTAO', 'DINHEIRO')),
    CONSTRAINT ck_pagamentos_status CHECK (status_pagamento IN ('PENDENTE', 'PAGO', 'CANCELADO', 'ESTORNADO')),
    CONSTRAINT ck_pagamentos_pago_em CHECK (
        (status_pagamento IN ('PENDENTE', 'CANCELADO') AND pago_em IS NULL)
        OR (status_pagamento IN ('PAGO', 'ESTORNADO') AND pago_em IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recibos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pagamento_id BIGINT NOT NULL,
    numero_recibo VARCHAR(60) NOT NULL,
    arquivo_url VARCHAR(500) NOT NULL,
    emitido_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_recibos PRIMARY KEY (id),
    CONSTRAINT fk_recibos_pagamentos FOREIGN KEY (pagamento_id) REFERENCES pagamentos (id) ON DELETE RESTRICT,
    CONSTRAINT uk_recibos_pagamento UNIQUE (pagamento_id),
    CONSTRAINT uk_recibos_numero UNIQUE (numero_recibo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notificacoes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    titulo VARCHAR(120) NOT NULL,
    mensagem VARCHAR(500) NOT NULL,
    lida BIT(1) NOT NULL DEFAULT b'0',
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_notificacoes PRIMARY KEY (id),
    CONSTRAINT fk_notificacoes_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE avaliacoes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    consulta_id BIGINT NOT NULL,
    paciente_id BIGINT NOT NULL,
    psicologo_id BIGINT NOT NULL,
    nota TINYINT NOT NULL,
    comentario VARCHAR(300),
    avaliado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_avaliacoes PRIMARY KEY (id),
    CONSTRAINT uk_avaliacoes_consulta UNIQUE (consulta_id),
    CONSTRAINT fk_avaliacoes_consultas FOREIGN KEY (consulta_id) REFERENCES consultas (id) ON DELETE RESTRICT,
    CONSTRAINT fk_avaliacoes_pacientes FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_avaliacoes_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT ck_avaliacoes_nota CHECK (nota BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evolucoes_clinicas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    paciente_id BIGINT NOT NULL,
    psicologo_id BIGINT NOT NULL,
    vinculo_id BIGINT,
    consulta_id BIGINT,
    titulo VARCHAR(500),
    temas_sessao TEXT,
    anotacoes_clinicas TEXT NOT NULL,
    nivel_engajamento VARCHAR(10),
    nivel_progresso INT,
    intercorrencias VARCHAR(1000),
    tarefas_encaminhamentos TEXT,
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_evolucoes_clinicas PRIMARY KEY (id),
    CONSTRAINT fk_evolucoes_clinicas_pacientes FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_evolucoes_clinicas_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_evolucoes_clinicas_vinculos FOREIGN KEY (vinculo_id) REFERENCES vinculo_psicologo_paciente (id) ON DELETE RESTRICT,
    CONSTRAINT fk_evolucoes_clinicas_consultas FOREIGN KEY (consulta_id) REFERENCES consultas (id) ON DELETE RESTRICT,
    CONSTRAINT ck_evolucoes_engajamento CHECK (nivel_engajamento IS NULL OR nivel_engajamento IN ('BAIXO', 'MEDIO', 'ALTO')),
    CONSTRAINT ck_evolucoes_progresso CHECK (nivel_progresso IS NULL OR nivel_progresso BETWEEN 1 AND 10),
    CONSTRAINT ck_evolucoes_temas_json CHECK (temas_sessao IS NULL OR JSON_VALID(temas_sessao))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_usuarios_tipo_ativo ON usuarios (tipo_usuario, ativo);
CREATE INDEX idx_psicologos_status_ativo ON psicologos (status_acesso, ativo);
CREATE INDEX idx_vinculo_psicologo_status ON vinculo_psicologo_paciente (psicologo_id, status, ativo, solicitado_em);
CREATE INDEX idx_vinculo_paciente_status ON vinculo_psicologo_paciente (paciente_id, status, ativo);
CREATE INDEX idx_regras_psicologo_dia ON regras_disponibilidade (psicologo_id, dia_semana, ativo, valido_a_partir_de, valido_ate);
CREATE INDEX idx_excecoes_psicologo_data_tipo ON excecoes_disponibilidade (psicologo_id, data, tipo, ativo);
CREATE INDEX idx_consultas_psicologo_periodo_status ON consultas (psicologo_id, ativo, status, inicio_em, paciente_id);
CREATE INDEX idx_consultas_paciente_periodo_status ON consultas (paciente_id, ativo, status, inicio_em, psicologo_id);
CREATE INDEX idx_consultas_agenda_overlap ON consultas (psicologo_id, ativo, inicio_em, fim_em, status);
CREATE INDEX idx_consultas_paciente_mes ON consultas (paciente_id, inicio_mes, status, ativo);
CREATE INDEX idx_consultas_vinculo_periodo ON consultas (vinculo_id, inicio_em);
CREATE INDEX idx_prontuarios_linha_tempo ON prontuarios_sessao (incluir_linha_tempo, ativo, consulta_id);
CREATE INDEX idx_registros_paciente_registrado ON registros_emocionais (paciente_id, ativo, registrado_em);
CREATE INDEX idx_registros_anotacoes_registro_criado ON registros_anotacoes (registro_emocional_id, ativo, criado_em);
CREATE INDEX idx_registros_anotacoes_psicologo_criado ON registros_anotacoes (psicologo_id, ativo, criado_em);
CREATE INDEX idx_registros_anotacoes_vinculo ON registros_anotacoes (vinculo_id, criado_em);
CREATE INDEX idx_pagamentos_status_pago_em ON pagamentos (status_pagamento, pago_em, ativo);
CREATE INDEX idx_pagamentos_pago_em_status ON pagamentos (pago_em, status_pagamento, ativo);
CREATE INDEX idx_pagamentos_consulta_status ON pagamentos (consulta_id, status_pagamento, ativo);
CREATE INDEX idx_pagamentos_periodo_total ON pagamentos (ativo, criado_em, consulta_id, status_pagamento);
CREATE INDEX idx_pagamentos_periodo_status ON pagamentos (status_pagamento, ativo, criado_em, consulta_id);
CREATE INDEX idx_notificacoes_usuario_lida_criado ON notificacoes (usuario_id, lida, ativo, criado_em);
CREATE INDEX idx_notificacoes_usuario_criado ON notificacoes (usuario_id, ativo, criado_em);
CREATE INDEX idx_avaliacoes_psicologo_avaliado ON avaliacoes (psicologo_id, ativo, avaliado_em, nota);
CREATE INDEX idx_avaliacoes_psicologo_consulta ON avaliacoes (psicologo_id, ativo, consulta_id, nota);
CREATE INDEX idx_avaliacoes_paciente_avaliado ON avaliacoes (paciente_id, avaliado_em);
CREATE INDEX idx_evolucoes_psicologo_paciente_criado ON evolucoes_clinicas (psicologo_id, paciente_id, ativo, criado_em);
CREATE INDEX idx_evolucoes_paciente_criado ON evolucoes_clinicas (paciente_id, ativo, criado_em);
CREATE INDEX idx_evolucoes_vinculo_criado ON evolucoes_clinicas (vinculo_id, criado_em);

DELIMITER //

CREATE TRIGGER trg_consultas_bi
BEFORE INSERT ON consultas
FOR EACH ROW
BEGIN
    DECLARE v_vinculo_id BIGINT;

    SELECT MIN(id)
      INTO v_vinculo_id
      FROM vinculo_psicologo_paciente
     WHERE paciente_id = NEW.paciente_id
       AND psicologo_id = NEW.psicologo_id
       AND ativo = b'1'
       AND status IN ('SOLICITADO', 'ACEITO');

    IF v_vinculo_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Consulta exige vinculo ativo entre paciente e psicologo';
    END IF;

    SET NEW.vinculo_id = v_vinculo_id;
END//

CREATE TRIGGER trg_consultas_bu
BEFORE UPDATE ON consultas
FOR EACH ROW
BEGIN
    DECLARE v_vinculo_id BIGINT;
    DECLARE v_avaliacoes INT DEFAULT 0;
    DECLARE v_pagamentos INT DEFAULT 0;

    IF NEW.vinculo_id IS NULL
        OR NEW.paciente_id <> OLD.paciente_id
        OR NEW.psicologo_id <> OLD.psicologo_id THEN

        SELECT MIN(id)
          INTO v_vinculo_id
          FROM vinculo_psicologo_paciente
         WHERE paciente_id = NEW.paciente_id
           AND psicologo_id = NEW.psicologo_id
           AND ativo = b'1'
           AND status IN ('SOLICITADO', 'ACEITO');

        IF v_vinculo_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Consulta exige vinculo ativo entre paciente e psicologo';
        END IF;

        SET NEW.vinculo_id = v_vinculo_id;
    END IF;

    IF NEW.status <> 'CONCLUIDA' THEN
        SELECT COUNT(*)
          INTO v_avaliacoes
          FROM avaliacoes
         WHERE consulta_id = OLD.id
           AND ativo = b'1';

        IF v_avaliacoes > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Consulta avaliada deve permanecer concluida';
        END IF;

        SELECT COUNT(*)
          INTO v_pagamentos
          FROM pagamentos
         WHERE consulta_id = OLD.id
           AND ativo = b'1';

        IF v_pagamentos > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Consulta com pagamento deve permanecer concluida';
        END IF;
    END IF;
END//

CREATE TRIGGER trg_pagamentos_bi
BEFORE INSERT ON pagamentos
FOR EACH ROW
BEGIN
    DECLARE v_consulta_count INT DEFAULT 0;
    DECLARE v_status VARCHAR(20);

    SELECT COUNT(*), MAX(status)
      INTO v_consulta_count, v_status
      FROM consultas
     WHERE id = NEW.consulta_id
       AND ativo = b'1';

    IF v_consulta_count = 0 OR v_status <> 'CONCLUIDA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pagamento exige consulta concluida e ativa';
    END IF;

    IF NEW.status_pagamento = 'PAGO' AND NEW.pago_em IS NULL THEN
        SET NEW.pago_em = CURRENT_TIMESTAMP(6);
    END IF;

    IF NEW.status_pagamento IN ('PENDENTE', 'CANCELADO') THEN
        SET NEW.pago_em = NULL;
    END IF;
END//

CREATE TRIGGER trg_pagamentos_bu
BEFORE UPDATE ON pagamentos
FOR EACH ROW
BEGIN
    DECLARE v_consulta_count INT DEFAULT 0;
    DECLARE v_status VARCHAR(20);

    SELECT COUNT(*), MAX(status)
      INTO v_consulta_count, v_status
      FROM consultas
     WHERE id = NEW.consulta_id
       AND ativo = b'1';

    IF v_consulta_count = 0 OR v_status <> 'CONCLUIDA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pagamento exige consulta concluida e ativa';
    END IF;

    IF NEW.status_pagamento = 'PAGO' AND NEW.pago_em IS NULL THEN
        SET NEW.pago_em = CURRENT_TIMESTAMP(6);
    END IF;

    IF NEW.status_pagamento IN ('PENDENTE', 'CANCELADO') THEN
        SET NEW.pago_em = NULL;
    END IF;
END//

CREATE TRIGGER trg_avaliacoes_bi
BEFORE INSERT ON avaliacoes
FOR EACH ROW
BEGIN
    DECLARE v_consulta_count INT DEFAULT 0;
    DECLARE v_status VARCHAR(20);
    DECLARE v_paciente_id BIGINT;
    DECLARE v_psicologo_id BIGINT;

    SELECT COUNT(*), MAX(status), MAX(paciente_id), MAX(psicologo_id)
      INTO v_consulta_count, v_status, v_paciente_id, v_psicologo_id
      FROM consultas
     WHERE id = NEW.consulta_id
       AND ativo = b'1';

    IF v_consulta_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Avaliacao exige consulta ativa';
    END IF;

    IF v_status <> 'CONCLUIDA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Avaliacao permitida apenas para consulta concluida';
    END IF;

    IF NEW.paciente_id <> v_paciente_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Paciente da avaliacao diverge da consulta';
    END IF;

    IF NEW.psicologo_id <> v_psicologo_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Psicologo da avaliacao diverge da consulta';
    END IF;

    IF NEW.avaliado_em IS NULL THEN
        SET NEW.avaliado_em = CURRENT_TIMESTAMP(6);
    END IF;
END//

CREATE TRIGGER trg_avaliacoes_bu
BEFORE UPDATE ON avaliacoes
FOR EACH ROW
BEGIN
    DECLARE v_consulta_count INT DEFAULT 0;
    DECLARE v_status VARCHAR(20);
    DECLARE v_paciente_id BIGINT;
    DECLARE v_psicologo_id BIGINT;

    SELECT COUNT(*), MAX(status), MAX(paciente_id), MAX(psicologo_id)
      INTO v_consulta_count, v_status, v_paciente_id, v_psicologo_id
      FROM consultas
     WHERE id = NEW.consulta_id
       AND ativo = b'1';

    IF v_consulta_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Avaliacao exige consulta ativa';
    END IF;

    IF v_status <> 'CONCLUIDA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Avaliacao permitida apenas para consulta concluida';
    END IF;

    IF NEW.paciente_id <> v_paciente_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Paciente da avaliacao diverge da consulta';
    END IF;

    IF NEW.psicologo_id <> v_psicologo_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Psicologo da avaliacao diverge da consulta';
    END IF;

    IF NEW.avaliado_em IS NULL THEN
        SET NEW.avaliado_em = OLD.avaliado_em;
    END IF;
END//

CREATE TRIGGER trg_registros_anotacoes_bi
BEFORE INSERT ON registros_anotacoes
FOR EACH ROW
BEGIN
    DECLARE v_vinculo_id BIGINT;

    SELECT MIN(vinculo.id)
      INTO v_vinculo_id
      FROM registros_emocionais registro
      JOIN vinculo_psicologo_paciente vinculo
        ON vinculo.paciente_id = registro.paciente_id
       AND vinculo.psicologo_id = NEW.psicologo_id
     WHERE registro.id = NEW.registro_emocional_id
       AND registro.ativo = b'1'
       AND vinculo.ativo = b'1'
       AND vinculo.status = 'ACEITO';

    IF v_vinculo_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Anotacao exige vinculo clinico aceito';
    END IF;

    SET NEW.vinculo_id = v_vinculo_id;
END//

CREATE TRIGGER trg_registros_anotacoes_bu
BEFORE UPDATE ON registros_anotacoes
FOR EACH ROW
BEGIN
    DECLARE v_vinculo_id BIGINT;

    IF NEW.vinculo_id IS NULL
        OR NEW.registro_emocional_id <> OLD.registro_emocional_id
        OR NEW.psicologo_id <> OLD.psicologo_id THEN

        SELECT MIN(vinculo.id)
          INTO v_vinculo_id
          FROM registros_emocionais registro
          JOIN vinculo_psicologo_paciente vinculo
            ON vinculo.paciente_id = registro.paciente_id
           AND vinculo.psicologo_id = NEW.psicologo_id
         WHERE registro.id = NEW.registro_emocional_id
           AND registro.ativo = b'1'
           AND vinculo.ativo = b'1'
           AND vinculo.status = 'ACEITO';

        IF v_vinculo_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Anotacao exige vinculo clinico aceito';
        END IF;

        SET NEW.vinculo_id = v_vinculo_id;
    END IF;
END//

CREATE TRIGGER trg_evolucoes_clinicas_bi
BEFORE INSERT ON evolucoes_clinicas
FOR EACH ROW
BEGIN
    DECLARE v_vinculo_id BIGINT;
    DECLARE v_consulta_count INT DEFAULT 0;
    DECLARE v_consulta_status VARCHAR(20);
    DECLARE v_consulta_paciente_id BIGINT;
    DECLARE v_consulta_psicologo_id BIGINT;

    SELECT MIN(id)
      INTO v_vinculo_id
      FROM vinculo_psicologo_paciente
     WHERE paciente_id = NEW.paciente_id
       AND psicologo_id = NEW.psicologo_id
       AND ativo = b'1'
       AND status = 'ACEITO';

    IF v_vinculo_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Evolucao clinica exige vinculo clinico aceito';
    END IF;

    SET NEW.vinculo_id = v_vinculo_id;

    IF NEW.consulta_id IS NOT NULL THEN
        SELECT COUNT(*), MAX(status), MAX(paciente_id), MAX(psicologo_id)
          INTO v_consulta_count, v_consulta_status, v_consulta_paciente_id, v_consulta_psicologo_id
          FROM consultas
         WHERE id = NEW.consulta_id
           AND ativo = b'1';

        IF v_consulta_count = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Evolucao clinica referencia consulta inexistente ou inativa';
        END IF;

        IF v_consulta_status <> 'CONCLUIDA' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Evolucao clinica vinculada exige consulta concluida';
        END IF;

        IF NEW.paciente_id <> v_consulta_paciente_id OR NEW.psicologo_id <> v_consulta_psicologo_id THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Evolucao clinica diverge da consulta vinculada';
        END IF;
    END IF;
END//

CREATE TRIGGER trg_evolucoes_clinicas_bu
BEFORE UPDATE ON evolucoes_clinicas
FOR EACH ROW
BEGIN
    DECLARE v_vinculo_id BIGINT;
    DECLARE v_consulta_count INT DEFAULT 0;
    DECLARE v_consulta_status VARCHAR(20);
    DECLARE v_consulta_paciente_id BIGINT;
    DECLARE v_consulta_psicologo_id BIGINT;

    IF NEW.vinculo_id IS NULL
        OR NEW.paciente_id <> OLD.paciente_id
        OR NEW.psicologo_id <> OLD.psicologo_id THEN

        SELECT MIN(id)
          INTO v_vinculo_id
          FROM vinculo_psicologo_paciente
         WHERE paciente_id = NEW.paciente_id
           AND psicologo_id = NEW.psicologo_id
           AND ativo = b'1'
           AND status = 'ACEITO';

        IF v_vinculo_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Evolucao clinica exige vinculo clinico aceito';
        END IF;

        SET NEW.vinculo_id = v_vinculo_id;
    END IF;

    IF NEW.consulta_id IS NOT NULL THEN
        SELECT COUNT(*), MAX(status), MAX(paciente_id), MAX(psicologo_id)
          INTO v_consulta_count, v_consulta_status, v_consulta_paciente_id, v_consulta_psicologo_id
          FROM consultas
         WHERE id = NEW.consulta_id
           AND ativo = b'1';

        IF v_consulta_count = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Evolucao clinica referencia consulta inexistente ou inativa';
        END IF;

        IF v_consulta_status <> 'CONCLUIDA' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Evolucao clinica vinculada exige consulta concluida';
        END IF;

        IF NEW.paciente_id <> v_consulta_paciente_id OR NEW.psicologo_id <> v_consulta_psicologo_id THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Evolucao clinica diverge da consulta vinculada';
        END IF;
    END IF;
END//

DELIMITER ;
