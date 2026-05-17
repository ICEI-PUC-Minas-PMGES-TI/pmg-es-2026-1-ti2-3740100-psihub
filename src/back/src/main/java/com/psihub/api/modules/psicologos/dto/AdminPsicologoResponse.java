package com.psihub.api.modules.psicologos.dto;

import com.psihub.api.shared.enums.StatusAcesso;
import java.math.BigDecimal;
import java.util.List;

public record AdminPsicologoResponse(
        Long id,
        String nome,
        String email,
        String crp,
        BigDecimal valorConsulta,
        List<String> especialidades,
        StatusAcesso statusAcesso,
        String motivoRevogacao
) {
}
