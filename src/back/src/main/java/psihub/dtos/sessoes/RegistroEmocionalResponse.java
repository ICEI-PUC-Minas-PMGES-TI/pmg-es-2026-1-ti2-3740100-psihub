package psihub.dtos.sessoes;

import java.time.LocalDateTime;
import java.util.List;

public record RegistroEmocionalResponse(
        Long id,
        Integer humorDia,
        String descricao,
        List<String> emocoes,
        LocalDateTime registradoEm
) {
}
