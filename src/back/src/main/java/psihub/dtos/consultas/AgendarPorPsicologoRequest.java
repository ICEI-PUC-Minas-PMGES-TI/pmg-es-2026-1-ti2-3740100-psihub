package psihub.dtos.consultas;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import psihub.domain.enums.TipoAtendimento;

public record AgendarPorPsicologoRequest(
        @NotNull Long pacienteId,
        @NotNull Long slotConsultaId,
        TipoAtendimento tipoAtendimento,
        @Size(max = 300) String observacoes
) {
}
