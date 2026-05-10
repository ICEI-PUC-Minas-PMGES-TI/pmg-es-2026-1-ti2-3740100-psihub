package psihub.dtos.agenda;

import java.time.LocalDate;
import java.time.LocalTime;
import psihub.domain.enums.DiaSemana;

public record RegraDisponibilidadeResponse(
        Long id,
        Long psicologoId,
        DiaSemana diaSemana,
        LocalDate validoAPartirDe,
        LocalDate validoAte,
        LocalTime horaInicio,
        LocalTime horaFim,
        LocalTime pausaInicio,
        LocalTime pausaFim,
        Integer duracaoSlotMinutos,
        Boolean ativo
) {
}
