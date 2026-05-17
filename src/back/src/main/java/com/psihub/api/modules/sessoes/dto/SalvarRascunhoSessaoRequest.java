package com.psihub.api.modules.sessoes.dto;

import com.psihub.api.modules.sessoes.entity.NivelEngajamento;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SalvarRascunhoSessaoRequest(
        @Size(max = 5000) String anotacoesClinicas,
        List<String> temasSessao,
        NivelEngajamento nivelEngajamento,
        @Size(max = 1000) String intercorrencias
) {
}

