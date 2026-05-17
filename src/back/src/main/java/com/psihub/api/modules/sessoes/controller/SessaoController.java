package com.psihub.api.modules.sessoes.controller;

import com.psihub.api.modules.sessoes.dto.EncerrarSessaoRequest;
import com.psihub.api.modules.sessoes.dto.IniciarSessaoRequest;
import com.psihub.api.modules.sessoes.dto.LinhaTempoSessaoResponse;
import com.psihub.api.modules.sessoes.dto.PreparacaoSessaoResponse;
import com.psihub.api.modules.sessoes.dto.ProntuarioSessaoResponse;
import com.psihub.api.modules.sessoes.dto.SalvarRascunhoSessaoRequest;
import com.psihub.api.modules.sessoes.service.SessaoService;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SessaoController {

    private final SessaoService sessaoService;

    public SessaoController(SessaoService sessaoService) {
        this.sessaoService = sessaoService;
    }

    @GetMapping("/consultas/{consultaId}/sessao/preparacao")
    public PreparacaoSessaoResponse preparar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId
    ) {
        validarPsicologo(user);
        return sessaoService.prepararComoPsicologo(consultaId, user.userId());
    }

    @PostMapping("/consultas/{consultaId}/sessao/iniciar")
    public ProntuarioSessaoResponse iniciar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId,
            @Valid @RequestBody(required = false) IniciarSessaoRequest request
    ) {
        validarPsicologo(user);
        return sessaoService.iniciarComoPsicologo(consultaId, user.userId(), request == null ? new IniciarSessaoRequest(null, null) : request);
    }

    @PutMapping("/consultas/{consultaId}/sessao/rascunho")
    public ProntuarioSessaoResponse salvarRascunho(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId,
            @Valid @RequestBody SalvarRascunhoSessaoRequest request
    ) {
        validarPsicologo(user);
        return sessaoService.salvarRascunhoComoPsicologo(consultaId, user.userId(), request);
    }

    @PostMapping("/consultas/{consultaId}/sessao/encerrar")
    public ProntuarioSessaoResponse encerrar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId,
            @Valid @RequestBody EncerrarSessaoRequest request
    ) {
        validarPsicologo(user);
        return sessaoService.encerrarComoPsicologo(consultaId, user.userId(), request);
    }

    @GetMapping("/pacientes/{pacienteId}/linha-do-tempo")
    public List<LinhaTempoSessaoResponse> linhaTempo(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long pacienteId,
            @RequestParam(required = false) Long psicologoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) String tema
    ) {
        validarPsicologo(user);
        return sessaoService.linhaTempo(pacienteId, user.userId(), inicio, fim, tema);
    }

    @GetMapping("/prontuarios/{prontuarioId}")
    public ProntuarioSessaoResponse detalharProntuario(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long prontuarioId
    ) {
        validarPsicologo(user);
        return sessaoService.detalharProntuarioComoPsicologo(prontuarioId, user.userId());
    }

    private void validarPsicologo(AuthenticatedUser user) {
        if (!user.isPsicologo()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas psicologos podem acessar prontuarios e sessoes");
        }
    }
}

