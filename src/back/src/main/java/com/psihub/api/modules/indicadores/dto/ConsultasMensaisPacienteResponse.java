package com.psihub.api.modules.indicadores.dto;

public record ConsultasMensaisPacienteResponse(
        Long pacienteId,
        String pacienteNome,
        int ano,
        int mes,
        long totalConsultas
) {}
