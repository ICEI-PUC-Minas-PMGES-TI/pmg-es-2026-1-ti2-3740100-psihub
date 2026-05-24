package com.psihub.api.modules.agenda.dto;

import com.psihub.api.modules.consultas.dto.FrequenciaRecorrencia;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public record CriarBloqueioRequest(
        @NotNull LocalDate data,
        @NotNull LocalTime horaInicio,
        @NotNull LocalTime horaFim,
        @Size(max = 300) String motivo,
        FrequenciaRecorrencia frequencia,
        @Min(1) @Max(48) Integer ocorrencias
) {
}
