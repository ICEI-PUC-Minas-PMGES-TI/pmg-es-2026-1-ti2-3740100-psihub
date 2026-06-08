package com.psihub.api.modules.registros.dto;

import java.time.LocalDateTime;

public record RegistroAnotacaoResponse(
        Long id,
        Long psicologoId,
        String texto,
        LocalDateTime criadoEm
) {
}

