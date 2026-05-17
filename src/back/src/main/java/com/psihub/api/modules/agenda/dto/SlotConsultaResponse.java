package com.psihub.api.modules.agenda.dto;

import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.enums.StatusSlotConsulta;
import com.psihub.api.shared.enums.TipoAtendimento;
import java.time.LocalDateTime;

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

