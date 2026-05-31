package com.psihub.api.modules.notificacoes.controller;

import com.psihub.api.modules.notificacoes.dto.NotificacaoResponse;
import com.psihub.api.modules.notificacoes.service.NotificacaoService;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios/me/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping
    public List<NotificacaoResponse> listar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) Boolean lida
    ) {
        return notificacaoService.listar(user.userId(), lida);
    }

    @PatchMapping("/{notificacaoId}/marcar-lida")
    public NotificacaoResponse marcarLida(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long notificacaoId
    ) {
        return notificacaoService.marcarLida(user.userId(), notificacaoId);
    }

    @PatchMapping("/marcar-todas-lidas")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcarTodasLidas(@AuthenticationPrincipal AuthenticatedUser user) {
        notificacaoService.marcarTodasLidas(user.userId());
    }
}
