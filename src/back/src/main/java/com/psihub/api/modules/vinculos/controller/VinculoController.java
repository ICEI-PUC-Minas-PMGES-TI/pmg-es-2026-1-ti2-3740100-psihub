package com.psihub.api.modules.vinculos.controller;

import com.psihub.api.modules.vinculos.dto.VinculoRequest;
import com.psihub.api.modules.vinculos.dto.VinculoResponse;
import com.psihub.api.modules.vinculos.entity.StatusVinculo;
import com.psihub.api.modules.vinculos.service.VinculoService;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/api")
public class VinculoController {

    private final VinculoService vinculoService;

    public VinculoController(VinculoService vinculoService) {
        this.vinculoService = vinculoService;
    }

    @PostMapping("/pacientes/me/vinculos")
    @ResponseStatus(HttpStatus.CREATED)
    public VinculoResponse solicitar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody VinculoRequest request
    ) {
        return vinculoService.solicitarComoPaciente(user.userId(), request.psicologoId());
    }

    @GetMapping("/psicologos/me/vinculos")
    public List<VinculoResponse> listar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) StatusVinculo status
    ) {
        return vinculoService.listarComoPsicologo(user.userId(), status);
    }

    @PatchMapping("/psicologos/me/vinculos/{vinculoId}/aceitar")
    public VinculoResponse aceitar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long vinculoId
    ) {
        return vinculoService.aceitarComoPsicologo(user.userId(), vinculoId);
    }

    @PatchMapping("/psicologos/me/vinculos/{vinculoId}/recusar")
    public VinculoResponse recusar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long vinculoId
    ) {
        return vinculoService.recusarComoPsicologo(user.userId(), vinculoId);
    }
}
