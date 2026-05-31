package com.psihub.api.modules.financeiro.dto;

import com.psihub.api.modules.financeiro.entity.StatusPagamento;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

public record ConfirmarPagamentoRequest(
        @NotNull(message = "statusPagamento e obrigatorio")
        StatusPagamento statusPagamento
) {
    @AssertTrue(message = "statusPagamento deve ser PAGO ou PENDENTE")
    public boolean isStatusValido() {
        return statusPagamento == StatusPagamento.PAGO || statusPagamento == StatusPagamento.PENDENTE;
    }
}
