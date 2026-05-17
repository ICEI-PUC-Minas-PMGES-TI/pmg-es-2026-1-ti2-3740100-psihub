package com.psihub.api.modules.psicologos.controller;

import com.psihub.api.modules.psicologos.dto.PerfilPsicologoRequest;
import com.psihub.api.modules.psicologos.dto.PerfilPsicologoResponse;
import com.psihub.api.modules.psicologos.dto.PsicologoDisponivelResponse;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/psicologos")
public class PsicologoController {

    private final PsicologoService psicologoService;

    public PsicologoController(PsicologoService psicologoService) {
        this.psicologoService = psicologoService;
    }

    @GetMapping("/disponiveis")
    public List<PsicologoDisponivelResponse> listarDisponiveis() {
        return psicologoService.listarDisponiveis();
    }

    @GetMapping("/me/perfil")
    public PerfilPsicologoResponse obterPerfil(@AuthenticationPrincipal AuthenticatedUser user) {
        return psicologoService.obterPerfil(user.userId());
    }

    @PatchMapping("/me/perfil")
    public PerfilPsicologoResponse atualizarPerfil(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody PerfilPsicologoRequest request
    ) {
        return psicologoService.atualizarPerfil(user.userId(), request);
    }
}

