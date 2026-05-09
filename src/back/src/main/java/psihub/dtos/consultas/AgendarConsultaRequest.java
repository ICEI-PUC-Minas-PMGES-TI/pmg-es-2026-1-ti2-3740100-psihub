package psihub.dtos.consultas;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import psihub.domain.enums.TipoAtendimento;

public record AgendarConsultaRequest(
        @NotNull Long pacienteId,
        @NotNull Long psicologoId,
        @NotNull Long slotConsultaId,
        @NotNull Long agendadoPorUsuarioId,
        TipoAtendimento tipoAtendimento,
        @Size(max = 300) String observacoes
) {
}
