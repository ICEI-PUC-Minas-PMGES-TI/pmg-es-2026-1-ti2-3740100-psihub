package com.psihub.api.modules.agenda.dto;

import java.util.List;

public record DisponibilidadeResponse(
        List<RegraDisponibilidadeResponse> regras,
        List<HorarioDisponivelDTO> slotsCriados
) {
}

