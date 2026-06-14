package com.psihub.api.modules.indicadores.dto;

import java.time.LocalDate;
import java.util.List;

public record IndicadoresDesempenhoResponse(
        LocalDate inicio,
        LocalDate fim,
        PagamentosEfetuadosIndicadorResponse pagamentosEfetuados,
        NotaMediaConsultasIndicadorResponse notaMediaConsultas,
        RetornoPacientesIndicadorResponse retornoPacientes,
        List<ConsultasMensaisPacienteResponse> consultasPorMesPorPaciente
) {}
