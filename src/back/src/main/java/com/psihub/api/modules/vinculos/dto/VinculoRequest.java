package com.psihub.api.modules.vinculos.dto;

import jakarta.validation.constraints.NotNull;

public record VinculoRequest(
        @NotNull Long psicologoId
) {
}
