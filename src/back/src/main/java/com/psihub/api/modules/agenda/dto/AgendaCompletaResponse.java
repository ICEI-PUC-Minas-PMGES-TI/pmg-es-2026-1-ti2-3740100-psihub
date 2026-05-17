package com.psihub.api.modules.agenda.dto;

import com.psihub.api.modules.consultas.dto.ConsultaResponse;
import java.util.List;

public record AgendaCompletaResponse(
        List<HorarioDisponivelDTO> horariosDisponiveis,
        List<ConsultaResponse> consultas
) {
}
