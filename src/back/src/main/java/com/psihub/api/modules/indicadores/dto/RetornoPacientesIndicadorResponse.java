package com.psihub.api.modules.indicadores.dto;

public record RetornoPacientesIndicadorResponse(
        long totalPacientesComConsultaConcluida,
        long pacientesComRetorno,
        double percentual
) {}
