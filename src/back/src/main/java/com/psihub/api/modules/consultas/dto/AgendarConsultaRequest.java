package com.psihub.api.modules.consultas.dto;

import com.psihub.api.modules.registros.dto.RegistroEmocionalRequest;
import com.psihub.api.shared.enums.TipoAtendimento;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AgendarConsultaRequest(
        Long pacienteId,
        @NotNull Long psicologoId,
        @NotNull LocalDateTime inicioEm,
        LocalDateTime fimEm,
        Long agendadoPorUsuarioId,
        TipoAtendimento tipoAtendimento,
        @Size(max = 300) String observacoes,
        // optional: include an emotional record to send to the psychologist
        RegistroEmocionalRequest registroEmocional,
        // optional: when true, create/mark vinculo as ACEITO immediately (default false)
        Boolean autoAceitarVinculo
) {
}

