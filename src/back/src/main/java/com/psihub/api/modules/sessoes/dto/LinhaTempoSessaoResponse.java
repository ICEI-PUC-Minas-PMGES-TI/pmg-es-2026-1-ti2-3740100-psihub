package com.psihub.api.modules.sessoes.dto;

import com.psihub.api.modules.sessoes.entity.NivelEngajamento;
import java.time.LocalDateTime;
import java.util.List;

public record LinhaTempoSessaoResponse(
        Long prontuarioId,
        Long consultaId,
        LocalDateTime inicioEm,
        LocalDateTime fimEm,
        List<String> temasSessao,
        Integer nivelProgresso,
        NivelEngajamento nivelEngajamento,
        String evolucaoClinica
) {
}

