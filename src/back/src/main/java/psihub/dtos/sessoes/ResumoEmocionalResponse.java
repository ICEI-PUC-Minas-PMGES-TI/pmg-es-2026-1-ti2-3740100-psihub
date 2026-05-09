package psihub.dtos.sessoes;

import java.time.LocalDateTime;
import java.util.List;

public record ResumoEmocionalResponse(
        Long pacienteId,
        LocalDateTime inicioPeriodo,
        LocalDateTime fimPeriodo,
        long totalRegistros,
        Double mediaHumor,
        Integer menorHumor,
        Integer maiorHumor,
        List<RegistroEmocionalResponse> registros
) {
}
