package com.psihub.api.modules.sessoes.dto;

import com.psihub.api.modules.sessoes.entity.NivelEngajamento;
import java.time.LocalDateTime;
import java.util.List;

public record EvolutaoClinicaResponse(
        Long evolucaoId,
        Long pacienteId,
        LocalDateTime criadoEm,
        String titulo,
        List<String> temasSessao,
        Integer nivelProgresso,
        NivelEngajamento nivelEngajamento,
        String anotacoesClinicas,
        String intercorrencias,
        String tarefasEncaminhamentos
) {
}

