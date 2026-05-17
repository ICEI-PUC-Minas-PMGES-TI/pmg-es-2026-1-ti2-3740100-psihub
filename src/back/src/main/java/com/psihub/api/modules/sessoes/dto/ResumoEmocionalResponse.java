package com.psihub.api.modules.sessoes.dto;

import java.time.LocalDateTime;
import java.util.List;

// DTO mantido em sessoes por compor a preparacao de sessao.
public record ResumoEmocionalResponse(
        Long pacienteId,
        LocalDateTime inicioPeriodo,
        LocalDateTime fimPeriodo,
        long totalRegistros,
        Double mediaHumor,
        Integer menorHumor,
        Integer maiorHumor,
        List<RegistroEmocionalResponse> registros
) {
}

