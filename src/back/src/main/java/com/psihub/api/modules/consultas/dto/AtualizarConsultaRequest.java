package com.psihub.api.modules.consultas.dto;

import com.psihub.api.shared.enums.TipoAtendimento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record AtualizarConsultaRequest(
        @NotNull LocalDateTime inicioEm,
        LocalDateTime fimEm,
        TipoAtendimento tipoAtendimento,
        @Size(max = 300) String observacoes
) {
}
