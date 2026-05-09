package psihub.dtos.agenda;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record CriarSlotManualRequest(
        @NotNull @FutureOrPresent LocalDate data,
        @NotNull LocalTime horaInicio,
        @NotNull LocalTime horaFim
) {
}
