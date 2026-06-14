package com.psihub.api.modules.avaliacoes.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegistrarAvaliacaoRequest(
        @NotNull @Min(1) @Max(5) Integer nota,
        @Size(max = 300) String comentario
) {}
