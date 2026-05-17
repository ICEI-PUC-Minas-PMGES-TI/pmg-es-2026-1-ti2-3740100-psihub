package com.psihub.api.modules.agenda.dto;

import com.psihub.api.shared.enums.DiaSemana;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record DefinirDisponibilidadeRequest(
        @NotEmpty Set<DiaSemana> diasSemana,
        @NotNull LocalTime horaInicio,
        @NotNull LocalTime horaFim,
        LocalTime pausaInicio,
        LocalTime pausaFim,
        @Positive Integer duracaoSlotMinutos,
        @NotNull LocalDate validoAPartirDe,
        LocalDate validoAte,
        @FutureOrPresent LocalDate gerarAte
) {
}

