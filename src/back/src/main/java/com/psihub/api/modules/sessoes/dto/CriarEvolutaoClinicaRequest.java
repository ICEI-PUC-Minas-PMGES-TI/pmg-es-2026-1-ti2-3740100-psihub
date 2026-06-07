package com.psihub.api.modules.sessoes.dto;

import com.psihub.api.modules.sessoes.entity.NivelEngajamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CriarEvolutaoClinicaRequest(
        @NotNull Long pacienteId,
        String titulo,
        List<String> temasSessao,
        @NotBlank String anotacoesClinicas,
        NivelEngajamento nivelEngajamento,
        Integer nivelProgresso,
        String intercorrencias,
        String tarefasEncaminhamentos
) {
}

