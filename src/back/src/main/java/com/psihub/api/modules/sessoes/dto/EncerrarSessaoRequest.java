package com.psihub.api.modules.sessoes.dto;

import com.psihub.api.modules.sessoes.entity.NivelEngajamento;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public record EncerrarSessaoRequest(
        @NotBlank @Size(max = 5000) String anotacoesClinicas,
        List<String> temasSessao,
        NivelEngajamento nivelEngajamento,
        @Size(max = 1000) String intercorrencias,
        @NotBlank @Size(max = 3000) String evolucaoClinica,
        List<String> intervencoes,
        @Size(max = 1000) String tarefasEncaminhamentos,
        @Min(1) @Max(10) Integer nivelProgresso,
        Boolean incluirLinhaTempo,
        LocalDateTime finalizadoEm
) {
}

