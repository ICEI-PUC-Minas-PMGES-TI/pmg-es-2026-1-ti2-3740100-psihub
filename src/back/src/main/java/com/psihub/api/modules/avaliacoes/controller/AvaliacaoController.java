package com.psihub.api.modules.avaliacoes.controller;

import com.psihub.api.modules.avaliacoes.dto.AvaliacaoResponse;
import com.psihub.api.modules.avaliacoes.dto.MediaAvaliacaoResponse;
import com.psihub.api.modules.avaliacoes.dto.RegistrarAvaliacaoRequest;
import com.psihub.api.modules.avaliacoes.service.AvaliacaoService;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    /** Paciente registra avaliação de uma consulta concluída */
    @PostMapping("/api/consultas/{consultaId}/avaliacao")
    @ResponseStatus(HttpStatus.CREATED)
    public AvaliacaoResponse registrar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId,
            @Valid @RequestBody RegistrarAvaliacaoRequest request
    ) {
        return avaliacaoService.registrar(user.userId(), consultaId, request);
    }

    /** Psicólogo lista suas avaliações */
    @GetMapping("/api/psicologos/me/avaliacoes")
    public List<AvaliacaoResponse> listarMinhasAvaliacoes(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return avaliacaoService.listarPorPsicologo(user.userId());
    }

    /** Qualquer usuário consulta a média de um psicólogo */
    @GetMapping("/api/psicologos/{id}/avaliacoes/media")
    public MediaAvaliacaoResponse media(@PathVariable Long id) {
        return avaliacaoService.mediaDosPsicologo(id);
    }
}
