package com.psihub.api.modules.psicologos.controller;

import com.psihub.api.modules.psicologos.dto.AdminPsicologoResponse;
import com.psihub.api.modules.psicologos.dto.RevogarPsicologoRequest;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.shared.enums.StatusAcesso;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/psicologos")
public class AdminPsicologoController {

    private final PsicologoService psicologoService;

    public AdminPsicologoController(PsicologoService psicologoService) {
        this.psicologoService = psicologoService;
    }

    @GetMapping
    public List<AdminPsicologoResponse> listar(@RequestParam(required = false) StatusAcesso status) {
        return psicologoService.listarParaAdmin(status);
    }

    @PostMapping("/{psicologoId}/acesso/aprovar")
    public AdminPsicologoResponse aprovar(@PathVariable Long psicologoId) {
        return psicologoService.aprovar(psicologoId);
    }

    @PostMapping("/{psicologoId}/acesso/revogar")
    public AdminPsicologoResponse revogar(
            @PathVariable Long psicologoId,
            @Valid @RequestBody(required = false) RevogarPsicologoRequest request
    ) {
        return psicologoService.revogar(psicologoId, request == null ? null : request.motivo());
    }
}
