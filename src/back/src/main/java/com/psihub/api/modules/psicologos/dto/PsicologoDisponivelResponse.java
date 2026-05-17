package com.psihub.api.modules.psicologos.dto;

import java.math.BigDecimal;
import java.util.List;

public record PsicologoDisponivelResponse(
        Long id,
        String nome,
        String crp,
        BigDecimal valorConsulta,
        String biografia,
        List<String> especialidades
) {
}

