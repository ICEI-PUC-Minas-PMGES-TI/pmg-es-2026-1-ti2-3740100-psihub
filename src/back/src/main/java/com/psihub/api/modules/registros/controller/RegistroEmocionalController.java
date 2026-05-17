package com.psihub.api.modules.registros.controller;

import com.psihub.api.modules.registros.dto.RegistroEmocionalRequest;
import com.psihub.api.modules.registros.service.RegistroEmocionalService;
import com.psihub.api.modules.sessoes.dto.RegistroEmocionalResponse;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pacientes/me/registros-emocionais")
public class RegistroEmocionalController {

    private final RegistroEmocionalService registroEmocionalService;

    public RegistroEmocionalController(RegistroEmocionalService registroEmocionalService) {
        this.registroEmocionalService = registroEmocionalService;
    }

    @GetMapping
    public List<RegistroEmocionalResponse> listar(@AuthenticationPrincipal AuthenticatedUser user) {
        return registroEmocionalService.listarComoPaciente(user.userId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RegistroEmocionalResponse criar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody RegistroEmocionalRequest request
    ) {
        return registroEmocionalService.criarComoPaciente(user.userId(), request);
    }

    @PatchMapping("/{registroId}")
    public RegistroEmocionalResponse atualizar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long registroId,
            @Valid @RequestBody RegistroEmocionalRequest request
    ) {
        return registroEmocionalService.atualizarComoPaciente(user.userId(), registroId, request);
    }
}
