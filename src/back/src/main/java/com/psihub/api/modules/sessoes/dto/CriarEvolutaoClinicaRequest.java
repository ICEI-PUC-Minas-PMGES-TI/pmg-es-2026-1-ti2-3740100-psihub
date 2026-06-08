package com.psihub.api.modules.sessoes.dto;

import com.psihub.api.modules.sessoes.entity.NivelEngajamento;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CriarEvolutaoClinicaRequest(
        @NotNull Long pacienteId,
        String titulo,
        List<String> temasSessao,
        @NotBlank String anotacoesClinicas,
        NivelEngajamento nivelEngajamento,
        @Min(1) @Max(10) Integer nivelProgresso,
        @Size(max = 5000) String intercorrencias,
        @Size(max = 5000) String tarefasEncaminhamentos
) {
}

