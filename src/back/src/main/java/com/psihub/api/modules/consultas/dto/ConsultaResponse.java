package com.psihub.api.modules.consultas.dto;

import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.enums.StatusSlotConsulta;
import com.psihub.api.shared.enums.TipoAtendimento;
import java.time.LocalDateTime;

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

