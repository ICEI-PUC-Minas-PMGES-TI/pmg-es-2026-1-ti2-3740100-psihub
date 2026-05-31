package com.psihub.api.modules.avaliacoes.dto;

import java.time.LocalDateTime;

public record AvaliacaoResponse(
        Long id,
        Long consultaId,
        String pacienteNome,
        int nota,
        String comentario,
        LocalDateTime criadoEm
) {}
