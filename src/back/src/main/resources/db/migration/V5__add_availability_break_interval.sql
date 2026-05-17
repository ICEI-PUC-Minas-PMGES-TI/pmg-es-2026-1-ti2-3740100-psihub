ALTER TABLE regras_disponibilidade
    ADD COLUMN pausa_inicio TIME,
    ADD COLUMN pausa_fim TIME;

ALTER TABLE regras_disponibilidade
    ADD CONSTRAINT ck_regras_pausa
        CHECK (
            (pausa_inicio IS NULL AND pausa_fim IS NULL)
            OR (
                pausa_inicio IS NOT NULL
                AND pausa_fim IS NOT NULL
                AND pausa_fim > pausa_inicio
                AND pausa_inicio >= hora_inicio
                AND pausa_fim <= hora_fim
            )
        );
