package com.psihub.api.modules.psicologos.dto;

import com.psihub.api.shared.enums.StatusAcesso;
import java.math.BigDecimal;
import java.util.List;

public record PerfilPsicologoResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        String fotoPerfilUrl,
        String crp,
        BigDecimal valorConsulta,
        String biografia,
        List<String> especialidades,
        StatusAcesso statusAcesso
) {
}
