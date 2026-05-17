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
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_pacientes PRIMARY KEY (id),
    CONSTRAINT fk_pacientes_usuarios FOREIGN KEY (id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE especialidades_psicologo (
    id BIGINT NOT NULL AUTO_INCREMENT,
    psicologo_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
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
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_vinculo_psicologo_paciente PRIMARY KEY (id),
    CONSTRAINT fk_vinculo_pacientes FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_vinculo_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT uk_vinculo_paciente_psicologo UNIQUE (paciente_id, psicologo_id),
    CONSTRAINT ck_vinculo_status CHECK (status IN ('SOLICITADO', 'ACEITO', 'RECUSADO', 'ENCERRADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE regras_disponibilidade (
    id BIGINT NOT NULL AUTO_INCREMENT,
    psicologo_id BIGINT NOT NULL,
    dia_semana VARCHAR(10) NOT NULL,
    valido_a_partir_de DATE NOT NULL,
    valido_ate DATE,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    duracao_slot_minutos INT NOT NULL,
    ativo BIT(1) NOT NULL DEFAULT b'1',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_regras_disponibilidade PRIMARY KEY (id),
    CONSTRAINT fk_regras_disponibilidade_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT ck_regras_dia CHECK (dia_semana IN ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO')),
    CONSTRAINT ck_regras_vigencia CHECK (valido_ate IS NULL OR valido_ate >= valido_a_partir_de),
    CONSTRAINT ck_regras_horario CHECK (hora_fim > hora_inicio),
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
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_excecoes_disponibilidade PRIMARY KEY (id),
    CONSTRAINT fk_excecoes_disponibilidade_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT ck_excecoes_tipo CHECK (tipo IN ('FOLGA', 'BLOQUEIO', 'JANELA_EXTRA')),
    CONSTRAINT ck_excecoes_horario CHECK (hora_inicio IS NULL OR hora_fim IS NULL OR hora_fim > hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE slots_consulta (
    id BIGINT NOT NULL AUTO_INCREMENT,
    psicologo_id BIGINT NOT NULL,
    regra_disponibilidade_id BIGINT,
    inicio_em DATETIME(6) NOT NULL,
    fim_em DATETIME(6) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL',
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_slots_consulta PRIMARY KEY (id),
    CONSTRAINT fk_slots_consulta_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_slots_consulta_regras FOREIGN KEY (regra_disponibilidade_id) REFERENCES regras_disponibilidade (id) ON DELETE SET NULL,
    CONSTRAINT uk_slots_consulta_periodo UNIQUE (psicologo_id, inicio_em, fim_em),
    CONSTRAINT ck_slots_status CHECK (status IN ('DISPONIVEL', 'RESERVADO', 'BLOQUEADO', 'CANCELADO')),
    CONSTRAINT ck_slots_periodo CHECK (fim_em > inicio_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE consultas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    paciente_id BIGINT NOT NULL,
    psicologo_id BIGINT NOT NULL,
    slot_consulta_id BIGINT NOT NULL,
    agendado_por_usuario_id BIGINT NOT NULL,
    iniciado_em DATETIME(6),
    finalizado_em DATETIME(6),
    tipo_atendimento VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    status VARCHAR(20) NOT NULL DEFAULT 'AGENDADA',
    observacoes VARCHAR(300),
    motivo_cancelamento VARCHAR(300),
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_consultas PRIMARY KEY (id),
    CONSTRAINT fk_consultas_pacientes FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_consultas_psicologos FOREIGN KEY (psicologo_id) REFERENCES psicologos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_consultas_slots FOREIGN KEY (slot_consulta_id) REFERENCES slots_consulta (id) ON DELETE RESTRICT,
    CONSTRAINT fk_consultas_agendado_por FOREIGN KEY (agendado_por_usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT,
    CONSTRAINT uk_consultas_slot UNIQUE (slot_consulta_id),
    CONSTRAINT ck_consultas_tipo CHECK (tipo_atendimento IN ('ONLINE', 'PRESENCIAL')),
    CONSTRAINT ck_consultas_status CHECK (status IN ('AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'FALTOU')),
    CONSTRAINT ck_consultas_periodo CHECK (iniciado_em IS NULL OR finalizado_em IS NULL OR finalizado_em > iniciado_em)
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
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_prontuarios_sessao PRIMARY KEY (id),
    CONSTRAINT fk_prontuarios_sessao_consultas FOREIGN KEY (consulta_id) REFERENCES consultas (id) ON DELETE RESTRICT,
    CONSTRAINT uk_prontuarios_sessao_consulta UNIQUE (consulta_id),
    CONSTRAINT ck_prontuarios_engajamento CHECK (nivel_engajamento IS NULL OR nivel_engajamento IN ('BAIXO', 'MEDIO', 'ALTO')),
    CONSTRAINT ck_prontuarios_progresso CHECK (nivel_progresso IS NULL OR nivel_progresso BETWEEN 1 AND 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registros_emocionais (
    id BIGINT NOT NULL AUTO_INCREMENT,
    paciente_id BIGINT NOT NULL,
    humor_dia INT NOT NULL,
    descricao VARCHAR(500),
    emocoes TEXT,
    registrado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    editavel_ate DATETIME(6) NOT NULL,
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_registros_emocionais PRIMARY KEY (id),
    CONSTRAINT fk_registros_emocionais_pacientes FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE RESTRICT,
    CONSTRAINT ck_registros_humor CHECK (humor_dia BETWEEN 1 AND 5),
    CONSTRAINT ck_registros_editavel CHECK (editavel_ate >= registrado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pagamentos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    consulta_id BIGINT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    forma_pagamento VARCHAR(20) NOT NULL,
    status_pagamento VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    pago_em DATETIME(6),
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_pagamentos PRIMARY KEY (id),
    CONSTRAINT fk_pagamentos_consultas FOREIGN KEY (consulta_id) REFERENCES consultas (id) ON DELETE RESTRICT,
    CONSTRAINT uk_pagamentos_consulta UNIQUE (consulta_id),
    CONSTRAINT ck_pagamentos_valor CHECK (valor > 0),
    CONSTRAINT ck_pagamentos_forma CHECK (forma_pagamento IN ('PIX', 'CARTAO', 'DINHEIRO')),
    CONSTRAINT ck_pagamentos_status CHECK (status_pagamento IN ('PENDENTE', 'PAGO', 'CANCELADO', 'ESTORNADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recibos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pagamento_id BIGINT NOT NULL,
    numero_recibo VARCHAR(60) NOT NULL,
    arquivo_url VARCHAR(500) NOT NULL,
    emitido_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_recibos PRIMARY KEY (id),
    CONSTRAINT fk_recibos_pagamentos FOREIGN KEY (pagamento_id) REFERENCES pagamentos (id) ON DELETE RESTRICT,
    CONSTRAINT uk_recibos_pagamento UNIQUE (pagamento_id),
    CONSTRAINT uk_recibos_numero UNIQUE (numero_recibo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_psicologos_status ON psicologos (status_acesso);
CREATE INDEX idx_vinculo_psicologo_status ON vinculo_psicologo_paciente (psicologo_id, status);
CREATE INDEX idx_vinculo_paciente_status ON vinculo_psicologo_paciente (paciente_id, status);
CREATE INDEX idx_regras_psicologo_dia ON regras_disponibilidade (psicologo_id, dia_semana, ativo);
CREATE INDEX idx_excecoes_psicologo_data ON excecoes_disponibilidade (psicologo_id, data);
CREATE INDEX idx_slots_psicologo_inicio_status ON slots_consulta (psicologo_id, inicio_em, status);
CREATE INDEX idx_consultas_paciente_status ON consultas (paciente_id, status);
CREATE INDEX idx_consultas_psicologo_status ON consultas (psicologo_id, status);
CREATE INDEX idx_registros_paciente_registrado ON registros_emocionais (paciente_id, registrado_em);
CREATE INDEX idx_pagamentos_status ON pagamentos (status_pagamento);
