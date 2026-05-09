package psihub.dtos.consultas;

import jakarta.validation.constraints.Size;

public record CancelarConsultaRequest(
        @Size(max = 300) String motivoCancelamento
) {
}
