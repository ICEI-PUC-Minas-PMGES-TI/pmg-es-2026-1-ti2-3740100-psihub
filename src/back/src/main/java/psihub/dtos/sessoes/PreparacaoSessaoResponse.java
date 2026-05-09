package psihub.dtos.sessoes;

import psihub.dtos.consultas.ConsultaResponse;

public record PreparacaoSessaoResponse(
        ConsultaResponse consulta,
        ResumoEmocionalResponse resumoEmocional,
        ProntuarioSessaoResponse prontuario
) {
}
