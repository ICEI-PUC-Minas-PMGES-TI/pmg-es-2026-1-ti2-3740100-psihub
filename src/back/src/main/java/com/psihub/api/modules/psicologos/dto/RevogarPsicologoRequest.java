package com.psihub.api.modules.psicologos.dto;

import jakarta.validation.constraints.Size;

public record RevogarPsicologoRequest(
        @Size(max = 300) String motivo
) {
}
