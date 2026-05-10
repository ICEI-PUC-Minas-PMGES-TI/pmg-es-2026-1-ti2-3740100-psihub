package psihub.dtos.agenda;

import java.time.LocalDateTime;
import psihub.domain.enums.StatusSlotConsulta;
import psihub.domain.enums.StatusConsulta;
import psihub.domain.enums.TipoAtendimento;

public record SlotConsultaResponse(
        Long id,
        Long psicologoId,
        Long regraDisponibilidadeId,
        LocalDateTime inicioEm,
        LocalDateTime fimEm,
        StatusSlotConsulta status,
        String pacienteNome,
        TipoAtendimento tipoAtendimento,
        StatusConsulta consultaStatus,
        String observacoes,
        String motivoCancelamento
) {
}
