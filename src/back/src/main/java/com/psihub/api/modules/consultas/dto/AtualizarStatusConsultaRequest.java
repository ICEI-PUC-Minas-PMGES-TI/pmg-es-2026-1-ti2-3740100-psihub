package com.psihub.api.modules.consultas.dto;

import com.psihub.api.shared.enums.StatusConsulta;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AtualizarStatusConsultaRequest(
        @NotNull StatusConsulta status,
        @Size(max = 300) String motivo
) {
}
