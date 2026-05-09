package psihub.dtos.agenda;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import psihub.domain.enums.DiaSemana;

public record DefinirDisponibilidadeRequest(
        @NotEmpty Set<DiaSemana> diasSemana,
        @NotNull LocalTime horaInicio,
        @NotNull LocalTime horaFim,
        @Positive Integer duracaoSlotMinutos,
        @NotNull LocalDate validoAPartirDe,
        LocalDate validoAte,
        @FutureOrPresent LocalDate gerarAte
) {
}
