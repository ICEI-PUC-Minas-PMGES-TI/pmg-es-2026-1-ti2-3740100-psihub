package com.psihub.api.modules.consultas.dto;

import com.psihub.api.shared.enums.TipoAtendimento;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record AgendarRecorrenciaRequest(
        @NotNull Long pacienteId,
        @NotNull LocalDateTime inicioEm,
        TipoAtendimento tipoAtendimento,
        @Size(max = 300) String observacoes,
        @NotNull FrequenciaRecorrencia frequencia,
        @NotNull @Min(2) @Max(48) Integer ocorrencias
) {
}
