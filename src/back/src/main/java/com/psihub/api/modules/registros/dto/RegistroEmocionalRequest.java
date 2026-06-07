package com.psihub.api.modules.registros.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;

public record RegistroEmocionalRequest(
        @Min(1) @Max(5) Integer humorDia,
        @Size(max = 500) String descricao,
        List<@Size(max = 80) String> emocoes
) {
}
