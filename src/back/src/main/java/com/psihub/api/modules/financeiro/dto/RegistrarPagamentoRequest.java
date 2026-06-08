package com.psihub.api.modules.financeiro.dto;

import com.psihub.api.modules.financeiro.entity.FormaPagamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record RegistrarPagamentoRequest(
        @NotNull(message = "consultaId é obrigatório")
        Long consultaId,

        @NotNull(message = "valor é obrigatório")
        @Positive(message = "valor deve ser positivo")
        BigDecimal valor,

        @NotNull(message = "formaPagamento é obrigatória")
        FormaPagamento formaPagamento
) {}
