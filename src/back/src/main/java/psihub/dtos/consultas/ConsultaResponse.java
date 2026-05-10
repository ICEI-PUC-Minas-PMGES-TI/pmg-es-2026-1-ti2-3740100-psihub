package psihub.dtos.consultas;

import java.time.LocalDateTime;
import psihub.domain.enums.StatusConsulta;
import psihub.domain.enums.StatusSlotConsulta;
import psihub.domain.enums.TipoAtendimento;

public record ConsultaResponse(
        Long id,
        Long pacienteId,
        String pacienteNome,
        String pacienteEmail,
        String pacienteTelefone,
        Long psicologoId,
        String psicologoNome,
        Long slotConsultaId,
        LocalDateTime inicioEm,
        LocalDateTime fimEm,
        StatusSlotConsulta statusSlot,
        TipoAtendimento tipoAtendimento,
        StatusConsulta status,
        String observacoes,
        String motivoCancelamento,
        Long agendadoPorUsuarioId,
        LocalDateTime iniciadoEm,
        LocalDateTime finalizadoEm
) {
}
