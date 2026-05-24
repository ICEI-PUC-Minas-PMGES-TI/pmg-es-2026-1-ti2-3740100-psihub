package com.psihub.api.modules.agenda.dto;

import java.time.LocalDateTime;

public record BloqueioSlotResponse(
        Long id,
        LocalDateTime inicioEm,
        LocalDateTime fimEm,
        String motivo,
        String status
) {
}
