package com.psihub.api.modules.registros.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroAnotacaoRequest(
        @NotBlank @Size(max = 5000) String texto
) {
}

