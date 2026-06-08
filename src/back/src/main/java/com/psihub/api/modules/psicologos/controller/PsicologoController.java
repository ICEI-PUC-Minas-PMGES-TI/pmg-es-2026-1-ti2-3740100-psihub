package com.psihub.api.modules.psicologos.controller;

import com.psihub.api.modules.psicologos.dto.PerfilPsicologoRequest;
import com.psihub.api.modules.psicologos.dto.PerfilPsicologoResponse;
import com.psihub.api.modules.psicologos.dto.PsicologoDisponivelResponse;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.modules.registros.service.RegistroEmocionalService;
import com.psihub.api.modules.vinculos.service.VinculoService;
import com.psihub.api.modules.registros.service.RegistroAnotacaoService;
import com.psihub.api.modules.sessoes.dto.RegistroEmocionalResponse;
import com.psihub.api.shared.utils.JsonListMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import jakarta.validation.Valid;
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
    private final RegistroEmocionalService registroEmocionalService;
    private final VinculoService vinculoService;
    private final RegistroAnotacaoService registroAnotacaoService;
    private final JsonListMapper jsonListMapper;

    public PsicologoController(
            PsicologoService psicologoService,
            RegistroEmocionalService registroEmocionalService,
            VinculoService vinculoService,
            RegistroAnotacaoService registroAnotacaoService,
            JsonListMapper jsonListMapper
    ) {
        this.psicologoService = psicologoService;
        this.registroEmocionalService = registroEmocionalService;
        this.vinculoService = vinculoService;
        this.registroAnotacaoService = registroAnotacaoService;
        this.jsonListMapper = jsonListMapper;
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

    @GetMapping("/pacientes/{pacienteId}/registros-emocionais")
    public List<RegistroEmocionalResponse> listarRegistrosComoPsicologo(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long pacienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        // exige que seja psicologo
        if (!user.isPsicologo()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Apenas psicologos podem acessar registros de pacientes");
        }

        // exige vinculo clinico aceito entre psicologo e paciente
        vinculoService.exigirVinculoAceito(pacienteId, user.userId());

        LocalDateTime inicioDt = inicio == null ? LocalDate.now().minusDays(30).atStartOfDay() : inicio.atStartOfDay();
        LocalDateTime fimDt = fim == null ? LocalDate.now().plusDays(1).atStartOfDay() : fim.plusDays(1).atStartOfDay();

        return registroEmocionalService.buscarPorPacienteEPeriodo(pacienteId, inicioDt, fimDt)
                .stream()
                .map(r -> new RegistroEmocionalResponse(
                        r.getId(),
                        r.getHumorDia(),
                        r.getDescricao(),
                        jsonListMapper.fromJson(r.getEmocoes()),
                        r.getRegistradoEm()
                ))
                .toList();
    }

    @GetMapping("/pacientes/{pacienteId}/registros-emocionais/{registroId}")
    public RegistroEmocionalResponse obterRegistroComoPsicologo(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long pacienteId,
            @PathVariable Long registroId
    ) {
        if (!user.isPsicologo()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Apenas psicologos podem acessar registros de pacientes");
        }

        vinculoService.exigirVinculoAceito(pacienteId, user.userId());

        var registro = registroEmocionalService.buscarPorId(registroId);
        if (!registro.getPaciente().getId().equals(pacienteId)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Registro emocional não encontrado");
        }

        return new RegistroEmocionalResponse(
                registro.getId(),
                registro.getHumorDia(),
                registro.getDescricao(),
                jsonListMapper.fromJson(registro.getEmocoes()),
                registro.getRegistradoEm()
        );
    }

    @GetMapping("/pacientes/{pacienteId}/registros-emocionais/{registroId}/anotacoes")
    public List<com.psihub.api.modules.registros.dto.RegistroAnotacaoResponse> listarAnotacoes(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long pacienteId,
            @PathVariable Long registroId
    ) {
        if (!user.isPsicologo()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Apenas psicologos podem acessar anotacoes");
        }
        return registroAnotacaoService.listarPorRegistro(user.userId(), pacienteId, registroId);
    }

    @PostMapping("/pacientes/{pacienteId}/registros-emocionais/{registroId}/anotacoes")
    public com.psihub.api.modules.registros.dto.RegistroAnotacaoResponse criarAnotacao(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long pacienteId,
            @PathVariable Long registroId,
            @Valid @RequestBody com.psihub.api.modules.registros.dto.RegistroAnotacaoRequest request
    ) {
        if (!user.isPsicologo()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Apenas psicologos podem criar anotacoes");
        }
        return registroAnotacaoService.criar(user.userId(), pacienteId, registroId, request);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/pacientes/{pacienteId}/registros-emocionais/{registroId}/anotacoes/{anotacaoId}")
    public void deletarAnotacao(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long pacienteId,
            @PathVariable Long registroId,
            @PathVariable Long anotacaoId
    ) {
        if (!user.isPsicologo()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Apenas psicologos podem remover anotacoes");
        }
        registroAnotacaoService.deletar(user.userId(), pacienteId, registroId, anotacaoId);
    }

}

