package com.psihub.api.modules.indicadores.dto;

public record PagamentosEfetuadosIndicadorResponse(
        long totalPagamentos,
        long pagamentosEfetuados,
        double percentual
) {}
