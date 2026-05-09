package psihub.dtos.sessoes;

import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record IniciarSessaoRequest(
        LocalDateTime iniciadoEm,
        @Size(max = 2000) String observacoesPreSessao
) {
}
