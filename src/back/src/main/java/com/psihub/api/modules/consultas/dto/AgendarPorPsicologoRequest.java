package com.psihub.api.modules.consultas.dto;

import com.psihub.api.shared.enums.TipoAtendimento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AgendarPorPsicologoRequest(
        @NotNull Long pacienteId,
        @NotNull Long slotConsultaId,
        TipoAtendimento tipoAtendimento,
        @Size(max = 300) String observacoes
) {
}

