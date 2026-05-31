package com.psihub.api.modules.financeiro.controller;

import com.psihub.api.modules.financeiro.dto.ConfirmarPagamentoRequest;
import com.psihub.api.modules.financeiro.dto.PagamentoResponse;
import com.psihub.api.modules.financeiro.dto.ReciboResponse;
import com.psihub.api.modules.financeiro.dto.RegistrarPagamentoRequest;
import com.psihub.api.modules.financeiro.entity.StatusPagamento;
import com.psihub.api.modules.financeiro.service.PagamentoService;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/psicologos/me/financeiro")
public class FinanceiroController {

    private final PagamentoService pagamentoService;

    public FinanceiroController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }

    @PostMapping("/pagamentos")
    @ResponseStatus(HttpStatus.CREATED)
    public PagamentoResponse registrarPagamento(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody RegistrarPagamentoRequest request
    ) {
        return pagamentoService.registrarPagamento(user.userId(), request);
    }

    @PatchMapping("/pagamentos/{id}/confirmar")
    public PagamentoResponse confirmarPagamento(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id,
            @Valid @RequestBody ConfirmarPagamentoRequest request
    ) {
        return pagamentoService.confirmarPagamento(user.userId(), id, request);
    }

    @PatchMapping("/pagamentos/{id}/estornar")
    public PagamentoResponse estornar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id
    ) {
        return pagamentoService.estornar(user.userId(), id);
    }

    @GetMapping("/pagamentos")
    public List<PagamentoResponse> listar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) StatusPagamento status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return pagamentoService.listar(user.userId(), status, inicio, fim);
    }

    @GetMapping("/pagamentos/{id}")
    public PagamentoResponse buscarPorId(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id
    ) {
        return pagamentoService.buscarPorId(user.userId(), id);
    }

    @GetMapping("/pagamentos/{id}/recibo")
    public ReciboResponse buscarRecibo(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id
    ) {
        return pagamentoService.buscarReciboPorPagamento(user.userId(), id);
    }
}
