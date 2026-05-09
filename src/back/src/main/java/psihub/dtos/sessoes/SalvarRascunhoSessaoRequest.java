package psihub.dtos.sessoes;

import jakarta.validation.constraints.Size;
import java.util.List;
import psihub.domain.enums.NivelEngajamento;

public record SalvarRascunhoSessaoRequest(
        @Size(max = 5000) String anotacoesClinicas,
        List<String> temasSessao,
        NivelEngajamento nivelEngajamento,
        @Size(max = 1000) String intercorrencias
) {
}
