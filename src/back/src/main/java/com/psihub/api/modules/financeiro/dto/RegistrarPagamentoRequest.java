package com.psihub.api.modules.financeiro.dto;

import com.psihub.api.modules.financeiro.entity.FormaPagamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record RegistrarPagamentoRequest(
        @NotNull(message = "consultaId e obrigatorio")
        Long consultaId,

        @NotNull(message = "valor e obrigatorio")
        @Positive(message = "valor deve ser positivo")
        BigDecimal valor,

        @NotNull(message = "formaPagamento e obrigatoria")
        FormaPagamento formaPagamento
) {}
