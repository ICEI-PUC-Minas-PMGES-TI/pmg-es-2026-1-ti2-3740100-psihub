package psihub.dtos.agenda;

import java.time.LocalDateTime;
import psihub.domain.enums.StatusSlotConsulta;

public record SlotConsultaResponse(
        Long id,
        Long psicologoId,
        Long regraDisponibilidadeId,
        LocalDateTime inicioEm,
        LocalDateTime fimEm,
        StatusSlotConsulta status
) {
}
