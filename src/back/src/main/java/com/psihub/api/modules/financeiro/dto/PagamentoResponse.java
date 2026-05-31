package com.psihub.api.modules.financeiro.dto;

import com.psihub.api.modules.financeiro.entity.FormaPagamento;
import com.psihub.api.modules.financeiro.entity.StatusPagamento;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PagamentoResponse(
        Long id,
        Long consultaId,
        BigDecimal valor,
        FormaPagamento formaPagamento,
        StatusPagamento statusPagamento,
        LocalDateTime pagoEm,
        ReciboResponse recibo
) {}
