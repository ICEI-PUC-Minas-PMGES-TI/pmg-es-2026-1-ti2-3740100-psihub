package com.psihub.api.modules.agenda.controller;

import com.psihub.api.modules.agenda.dto.AgendaCompletaResponse;
import com.psihub.api.modules.agenda.dto.BloqueioSlotResponse;
import com.psihub.api.modules.agenda.dto.CriarBloqueioRequest;
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
import com.psihub.api.shared.utils.DateTimeParser;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;

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

    @DeleteMapping("/me/disponibilidades/{regraId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerMinhaRegra(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long regraId
    ) {
        agendaService.removerRegra(user.userId(), regraId);
    }

    @GetMapping("/me/agenda/slots")
    public AgendaCompletaResponse listarMinhaAgenda(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) String inicio,
            @RequestParam(required = false) String fim
    ) {
        LocalDateTime inicioPeriodo = DateTimeParser.parseDateTimeOrDefault(inicio, LocalDate.now().atStartOfDay(), false);
        LocalDateTime fimPeriodo = DateTimeParser.parseDateTimeOrDefault(fim, inicioPeriodo.plusDays(30), true);
        return agendaService.listarAgendaCompleta(user.userId(), inicioPeriodo, fimPeriodo);
    }

    @GetMapping("/me/agenda/bloqueios")
    public List<BloqueioSlotResponse> listarMeusBloqueios(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) String inicio,
            @RequestParam(required = false) String fim
    ) {
        LocalDateTime inicioPeriodo = DateTimeParser.parseDateTimeOrDefault(inicio, LocalDate.now().atStartOfDay(), false);
        LocalDateTime fimPeriodo = DateTimeParser.parseDateTimeOrDefault(fim, inicioPeriodo.plusDays(30), true);
        return agendaService.listarBloqueios(user.userId(), inicioPeriodo, fimPeriodo);
    }

    @PostMapping("/me/agenda/bloqueios")
    @ResponseStatus(HttpStatus.CREATED)
    public List<BloqueioSlotResponse> criarBloqueio(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CriarBloqueioRequest request
    ) {
        return agendaService.criarBloqueios(user.userId(), request);
    }

    @PatchMapping("/me/agenda/bloqueios/{bloqueioId}/cancelar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerBloqueio(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long bloqueioId
    ) {
        agendaService.removerBloqueio(user.userId(), bloqueioId);
    }

    @PostMapping("/me/agenda/slots")
    public void criarSlotManualRemovido() {
        throw new ApiException(
                HttpStatus.GONE,
                "Criacao manual de slots foi removida. Configure regras de disponibilidade ou excecoes de agenda."
        );
    }

    @GetMapping("/{psicologoId}/agenda/slots/disponiveis")
    public List<HorarioDisponivelDTO> listarSlotsDisponiveis(
            @PathVariable Long psicologoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        return agendaService.listarDisponibilidade(psicologoId, data, data);
    }

    @GetMapping("/{psicologoId}/agenda/slots-publicos")
    public List<HorarioDisponivelDTO> listarSlotsPublicos(
            @PathVariable Long psicologoId,
            @RequestParam String inicio,
            @RequestParam String fim
    ) {
        return agendaService.listarDisponibilidade(
                psicologoId,
                DateTimeParser.parseRequiredDateTime(inicio, "inicio", false),
                DateTimeParser.parseRequiredDateTime(fim, "fim", true)
        );
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
        agendaService.validarPsicologoAutenticado(user, psicologoId);
        return agendaService.definirDisponibilidade(user.userId(), request);
    }

    @GetMapping("/{psicologoId}/disponibilidades")
    public List<RegraDisponibilidadeResponse> listarRegrasLegado(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long psicologoId
    ) {
        agendaService.validarPsicologoAutenticado(user, psicologoId);
        return agendaService.listarRegras(user.userId());
    }

}
