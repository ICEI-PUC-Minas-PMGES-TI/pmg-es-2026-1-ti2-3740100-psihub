package com.psihub.api.modules.agenda.controller;

import com.psihub.api.modules.agenda.dto.DefinirDisponibilidadeRequest;
import com.psihub.api.modules.agenda.dto.DisponibilidadeResponse;
import com.psihub.api.modules.agenda.dto.HorarioDisponivelDTO;
import com.psihub.api.modules.agenda.dto.PacienteResumoResponse;
import com.psihub.api.modules.agenda.dto.RegraDisponibilidadeResponse;
import com.psihub.api.modules.agenda.service.AgendaService;
import com.psihub.api.modules.consultas.dto.AgendarPorPsicologoRequest;
import com.psihub.api.modules.consultas.dto.ConsultaResponse;
import com.psihub.api.modules.consultas.service.ConsultaService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/psicologos")
public class AgendaController {

    private final AgendaService agendaService;
    private final ConsultaService consultaService;

    public AgendaController(AgendaService agendaService, ConsultaService consultaService) {
        this.agendaService = agendaService;
        this.consultaService = consultaService;
    }

    @PostMapping("/me/agenda/agendamentos")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsultaResponse agendarParaPaciente(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody AgendarPorPsicologoRequest request
    ) {
        return consultaService.agendarComoPsicologo(user.userId(), request);
    }

    @GetMapping("/me/pacientes")
    public List<PacienteResumoResponse> listarMeusPacientes(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) String nome
    ) {
        return agendaService.listarPacientesVinculados(user.userId(), nome);
    }

    @PostMapping("/me/disponibilidades")
    @ResponseStatus(HttpStatus.CREATED)
    public DisponibilidadeResponse definirMinhaDisponibilidade(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody DefinirDisponibilidadeRequest request
    ) {
        return agendaService.definirDisponibilidade(user.userId(), request);
    }

    @GetMapping("/me/disponibilidades")
    public List<RegraDisponibilidadeResponse> listarMinhasRegras(@AuthenticationPrincipal AuthenticatedUser user) {
        return agendaService.listarRegras(user.userId());
    }

    @GetMapping("/{psicologoId}/agenda/disponibilidades/slots")
    public List<HorarioDisponivelDTO> listarDisponibilidadesSlots(
            @PathVariable Long psicologoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate
    ) {
        return agendaService.listarDisponibilidade(psicologoId, de, ate);
    }

    @PostMapping("/{psicologoId}/disponibilidades")
    @ResponseStatus(HttpStatus.CREATED)
    public DisponibilidadeResponse definirDisponibilidadeLegado(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long psicologoId,
            @Valid @RequestBody DefinirDisponibilidadeRequest request
    ) {
        validarPsicologoAutenticado(user, psicologoId);
        return agendaService.definirDisponibilidade(user.userId(), request);
    }

    @GetMapping("/{psicologoId}/disponibilidades")
    public List<RegraDisponibilidadeResponse> listarRegrasLegado(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long psicologoId
    ) {
        validarPsicologoAutenticado(user, psicologoId);
        return agendaService.listarRegras(user.userId());
    }

    private void validarPsicologoAutenticado(AuthenticatedUser user, Long psicologoId) {
        if (!user.isPsicologo() || !user.userId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Voce nao tem permissao para acessar esta agenda");
        }
    }
}

