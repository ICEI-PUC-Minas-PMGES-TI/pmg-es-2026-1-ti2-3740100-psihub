package com.psihub.api.modules.psicologos.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record PerfilPsicologoRequest(
        @Size(max = 150) String nome,
        @Size(max = 30) String telefone,
        @Size(max = 500) String fotoPerfilUrl,
        @Size(max = 30) String crp,
        @DecimalMin("0.00") BigDecimal valorConsulta,
        @Size(max = 500) String biografia,
        List<@Size(max = 100) String> especialidades
) {
}
