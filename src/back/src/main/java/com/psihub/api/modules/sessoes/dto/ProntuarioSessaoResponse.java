package com.psihub.api.modules.sessoes.dto;

import com.psihub.api.modules.sessoes.entity.NivelEngajamento;
import java.time.LocalDateTime;
import java.util.List;

public record ProntuarioSessaoResponse(
        Long id,
        Long consultaId,
        String observacoesPreSessao,
        String anotacoesClinicas,
        List<String> temasSessao,
        NivelEngajamento nivelEngajamento,
        String intercorrencias,
        String evolucaoClinica,
        List<String> intervencoes,
        String tarefasEncaminhamentos,
        Integer nivelProgresso,
        Boolean incluirLinhaTempo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
}

