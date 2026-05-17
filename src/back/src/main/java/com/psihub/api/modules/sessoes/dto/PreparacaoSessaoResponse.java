package com.psihub.api.modules.sessoes.dto;

import com.psihub.api.modules.consultas.dto.ConsultaResponse;

public record PreparacaoSessaoResponse(
        ConsultaResponse consulta,
        ResumoEmocionalResponse resumoEmocional,
        ProntuarioSessaoResponse prontuario
) {
}

