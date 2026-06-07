package com.psihub.api.modules.registros.dto;

import jakarta.validation.constraints.NotBlank;

public record RegistroAnotacaoRequest(
        @NotBlank String texto
) {
}

