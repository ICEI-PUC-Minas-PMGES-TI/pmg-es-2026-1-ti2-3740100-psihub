package psihub.dtos.sessoes;

import java.time.LocalDateTime;
import java.util.List;
import psihub.domain.enums.NivelEngajamento;

public record LinhaTempoSessaoResponse(
        Long prontuarioId,
        Long consultaId,
        LocalDateTime inicioEm,
        LocalDateTime fimEm,
        List<String> temasSessao,
        Integer nivelProgresso,
        NivelEngajamento nivelEngajamento,
        String evolucaoClinica
) {
}
