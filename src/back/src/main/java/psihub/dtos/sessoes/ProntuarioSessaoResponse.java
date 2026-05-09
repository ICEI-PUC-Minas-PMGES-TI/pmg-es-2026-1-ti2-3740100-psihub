package psihub.dtos.sessoes;

import java.time.LocalDateTime;
import java.util.List;
import psihub.domain.enums.NivelEngajamento;

public record ProntuarioSessaoResponse(
        Long id,
        Long consultaId,
        String observacoesPreSessao,
        String anotacoesClinicas,
        List<String> temasSessao,
        NivelEngajamento nivelEngajamento,
        String intercorrencias,
        String evolucaoClinica,
        List<String> intervencoes,
        String tarefasEncaminhamentos,
        Integer nivelProgresso,
        Boolean incluirLinhaTempo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
}
