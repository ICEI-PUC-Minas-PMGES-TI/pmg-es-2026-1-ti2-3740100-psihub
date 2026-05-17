package com.psihub.api.modules.vinculos.dto;

import com.psihub.api.modules.vinculos.entity.StatusVinculo;
import java.time.LocalDateTime;

public record VinculoResponse(
        Long id,
        Long pacienteId,
        String pacienteNome,
        String pacienteEmail,
        Long psicologoId,
        String psicologoNome,
        StatusVinculo status,
        LocalDateTime solicitadoEm,
        LocalDateTime respondidoEm
) {
}
