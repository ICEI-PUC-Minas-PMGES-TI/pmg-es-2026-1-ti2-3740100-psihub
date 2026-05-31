package com.psihub.api.modules.financeiro.dto;

import java.math.BigDecimal;

public record ResumoFinanceiroResponse(
        BigDecimal totalPago,
        BigDecimal totalPendente,
        BigDecimal totalEstornado,
        int quantidadeConsultas
) {}
