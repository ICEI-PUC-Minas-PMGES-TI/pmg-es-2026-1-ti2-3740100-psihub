package com.psihub.api.modules.pacientes.dto;

import com.psihub.api.modules.sessoes.dto.RegistroEmocionalResponse;
import java.util.List;

public record PacienteDashboardResponse(
        PacientePerfilResponse perfil,
        List<RegistroEmocionalResponse> registrosRecentes
) {
}
