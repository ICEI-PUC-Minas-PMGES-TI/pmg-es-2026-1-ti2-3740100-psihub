ALTER TABLE evolucoes_clinicas
    ADD CONSTRAINT chk_nivel_progresso
        CHECK (nivel_progresso IS NULL OR nivel_progresso BETWEEN 1 AND 10);
