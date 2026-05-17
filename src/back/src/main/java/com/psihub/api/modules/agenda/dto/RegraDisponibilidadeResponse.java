package com.psihub.api.modules.agenda.dto;

import com.psihub.api.shared.enums.DiaSemana;
import java.time.LocalDate;
import java.time.LocalTime;

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

