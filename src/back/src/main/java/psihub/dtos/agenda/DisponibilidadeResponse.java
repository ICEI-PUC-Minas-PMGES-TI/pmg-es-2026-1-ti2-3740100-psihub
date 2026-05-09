package psihub.dtos.agenda;

import java.util.List;

public record DisponibilidadeResponse(
        List<RegraDisponibilidadeResponse> regras,
        List<SlotConsultaResponse> slotsCriados
) {
}
