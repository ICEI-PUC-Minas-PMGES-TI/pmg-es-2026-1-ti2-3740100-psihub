package com.psihub.api.modules.consultas.dto;

import com.psihub.api.shared.enums.TipoAtendimento;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AgendarPorPsicologoRequest(
        @NotNull Long pacienteId,
        @NotNull LocalDateTime inicioEm,
        LocalDateTime fimEm,
        TipoAtendimento tipoAtendimento,
        @Size(max = 300) String observacoes
) {
}

