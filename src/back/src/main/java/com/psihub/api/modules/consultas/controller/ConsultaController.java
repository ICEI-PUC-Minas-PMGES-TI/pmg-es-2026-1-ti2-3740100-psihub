package com.psihub.api.modules.consultas.controller;

import com.psihub.api.modules.consultas.dto.AgendarConsultaRequest;
import com.psihub.api.modules.consultas.dto.AgendarRecorrenciaRequest;
import com.psihub.api.modules.consultas.dto.AtualizarConsultaRequest;
import com.psihub.api.modules.consultas.dto.AtualizarStatusConsultaRequest;
import com.psihub.api.modules.consultas.dto.CancelarConsultaRequest;
import com.psihub.api.modules.consultas.dto.ConsultaResponse;
import com.psihub.api.modules.consultas.service.ConsultaService;
import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.exception.ApiException;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/api/consultas")
public class ConsultaController {

    private final ConsultaService consultaService;

    public ConsultaController(ConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @PostMapping("/agendamentos")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsultaResponse agendar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody AgendarConsultaRequest request
    ) {
        if (!user.isPaciente()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas pacientes podem agendar consultas");
        }

        return consultaService.agendarComoPaciente(user.userId(), request);
    }

    @GetMapping
    public List<ConsultaResponse> listar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) StatusConsulta status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(defaultValue = "false") boolean historico
    ) {
        Long pacienteAutenticado = user.isPaciente() ? user.userId() : null;
        Long psicologoAutenticado = user.isPsicologo() ? user.userId() : null;
        return consultaService.listar(pacienteAutenticado, psicologoAutenticado, status, inicio, fim, historico);
    }

    @GetMapping("/{consultaId}")
    public ConsultaResponse detalhar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId
    ) {
        return consultaService.detalharComoUsuario(consultaId, user.userId(), user.tipo());
    }

    @PatchMapping("/{consultaId}/confirmar")
    public ConsultaResponse confirmar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId
    ) {
        if (!user.isPsicologo()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas psicólogos podem confirmar consultas");
        }

        return consultaService.confirmarComoPsicologo(consultaId, user.userId());
    }

    @PatchMapping("/{consultaId}/cancelar")
    public ConsultaResponse cancelar(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId,
            @Valid @RequestBody(required = false) CancelarConsultaRequest request
    ) {
        return consultaService.cancelarComoUsuario(consultaId, user.userId(), user.tipo(), request);
    }

    @PatchMapping("/{consultaId}/status")
    public ConsultaResponse atualizarStatus(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId,
            @Valid @RequestBody AtualizarStatusConsultaRequest request
    ) {
        return consultaService.atualizarStatusComoUsuario(consultaId, user.userId(), user.tipo(), request);
    }

    @PutMapping("/{consultaId}")
    public ConsultaResponse atualizarConsulta(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId,
            @Valid @RequestBody AtualizarConsultaRequest request
    ) {
        if (!user.isPsicologo()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas psicólogos podem editar consultas");
        }
        return consultaService.atualizarComoPsicologo(consultaId, user.userId(), request);
    }

    @DeleteMapping("/{consultaId}")
    public ConsultaResponse excluirConsulta(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long consultaId
    ) {
        if (!user.isPsicologo()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas psicólogos podem excluir consultas");
        }
        return consultaService.excluirComoPsicologo(consultaId, user.userId());
    }

    @PostMapping("/recorrencias")
    @ResponseStatus(HttpStatus.CREATED)
    public List<ConsultaResponse> agendarRecorrencia(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody AgendarRecorrenciaRequest request
    ) {
        if (!user.isPsicologo()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas psicólogos podem criar recorrências");
        }
        return consultaService.agendarRecorrenciaComoPsicologo(user.userId(), request);
    }
}

