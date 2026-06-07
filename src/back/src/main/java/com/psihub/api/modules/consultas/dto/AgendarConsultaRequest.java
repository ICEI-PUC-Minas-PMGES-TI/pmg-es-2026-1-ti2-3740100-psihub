package com.psihub.api.modules.consultas.dto;

import com.psihub.api.shared.enums.TipoAtendimento;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AgendarConsultaRequest(
        Long pacienteId,
        @NotNull Long psicologoId,
        @NotNull LocalDateTime inicioEm,
        LocalDateTime fimEm,
        Long agendadoPorUsuarioId,
        TipoAtendimento tipoAtendimento,
        @Size(max = 300) String observacoes
) {
}

