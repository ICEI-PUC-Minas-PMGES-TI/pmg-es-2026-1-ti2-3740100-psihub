package com.psihub.api.modules.consultas.dto;

import jakarta.validation.constraints.Size;

public record CancelarConsultaRequest(
        @Size(max = 300) String motivoCancelamento
) {
}

