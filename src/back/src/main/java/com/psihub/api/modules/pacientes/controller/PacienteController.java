package com.psihub.api.modules.pacientes.controller;

import com.psihub.api.modules.pacientes.dto.PacienteDashboardResponse;
import com.psihub.api.modules.pacientes.dto.PacientePerfilRequest;
import com.psihub.api.modules.pacientes.dto.PacientePerfilResponse;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.registros.service.RegistroEmocionalService;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pacientes/me")
public class PacienteController {

    private final PacienteService pacienteService;
    private final RegistroEmocionalService registroEmocionalService;

    public PacienteController(PacienteService pacienteService, RegistroEmocionalService registroEmocionalService) {
        this.pacienteService = pacienteService;
        this.registroEmocionalService = registroEmocionalService;
    }

    @GetMapping("/dashboard")
    public PacienteDashboardResponse dashboard(@AuthenticationPrincipal AuthenticatedUser user) {
        return new PacienteDashboardResponse(
                pacienteService.obterPerfil(user.userId()),
                registroEmocionalService.listarComoPaciente(user.userId()).stream().limit(5).toList()
        );
    }

    @GetMapping("/perfil")
    public PacientePerfilResponse obterPerfil(@AuthenticationPrincipal AuthenticatedUser user) {
        return pacienteService.obterPerfil(user.userId());
    }

    @PatchMapping("/perfil")
    public PacientePerfilResponse atualizarPerfil(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody PacientePerfilRequest request
    ) {
        return pacienteService.atualizarPerfil(user.userId(), request);
    }
}
