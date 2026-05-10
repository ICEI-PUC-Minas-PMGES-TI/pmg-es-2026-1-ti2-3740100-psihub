package psihub.controllers;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
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
import psihub.domain.enums.StatusSlotConsulta;
import psihub.dtos.agenda.BloquearSlotRequest;
import psihub.dtos.agenda.CriarSlotManualRequest;
import psihub.dtos.agenda.DefinirDisponibilidadeRequest;
import psihub.dtos.agenda.DisponibilidadeResponse;
import psihub.dtos.agenda.RegraDisponibilidadeResponse;
import psihub.dtos.agenda.SlotConsultaResponse;
import psihub.exceptions.ApiException;
import psihub.security.AuthenticatedUser;
import psihub.services.AgendaService;

@RestController
@RequestMapping("/api/psicologos")
public class AgendaController {

    private final AgendaService agendaService;

    public AgendaController(AgendaService agendaService) {
        this.agendaService = agendaService;
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

    @PostMapping("/me/agenda/slots")
    @ResponseStatus(HttpStatus.CREATED)
    public SlotConsultaResponse criarMeuSlotManual(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CriarSlotManualRequest request
    ) {
        return agendaService.criarSlotManual(user.userId(), request);
    }

    @GetMapping("/me/agenda/slots")
    public List<SlotConsultaResponse> listarMeusSlots(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(required = false) StatusSlotConsulta status
    ) {
        return agendaService.listarSlots(user.userId(), inicio, fim, status);
    }

    @PatchMapping("/me/agenda/slots/{slotId}/bloquear")
    public SlotConsultaResponse bloquearMeuSlot(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long slotId,
            @Valid @RequestBody(required = false) BloquearSlotRequest request
    ) {
        return agendaService.bloquearSlot(user.userId(), slotId, request == null ? new BloquearSlotRequest(null) : request);
    }

    @PatchMapping("/me/agenda/slots/{slotId}/cancelar")
    public SlotConsultaResponse cancelarMeuSlot(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long slotId
    ) {
        return agendaService.cancelarSlot(user.userId(), slotId);
    }

    @GetMapping("/{psicologoId}/agenda/slots/disponiveis")
    public List<SlotConsultaResponse> listarSlotsDisponiveis(
            @PathVariable Long psicologoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        return agendaService.listarSlotsDisponiveis(psicologoId, data);
    }

    @GetMapping("/{psicologoId}/agenda/slots-publicos")
    public List<SlotConsultaResponse> listarSlotsPublicos(
            @PathVariable Long psicologoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim
    ) {
        return agendaService.listarSlots(psicologoId, inicio, fim, null);
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

    @PostMapping("/{psicologoId}/agenda/slots")
    @ResponseStatus(HttpStatus.CREATED)
    public SlotConsultaResponse criarSlotManualLegado(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long psicologoId,
            @Valid @RequestBody CriarSlotManualRequest request
    ) {
        validarPsicologoAutenticado(user, psicologoId);
        return agendaService.criarSlotManual(user.userId(), request);
    }

    @GetMapping("/{psicologoId}/agenda/slots")
    public List<SlotConsultaResponse> listarSlotsLegado(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long psicologoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(required = false) StatusSlotConsulta status
    ) {
        validarPsicologoAutenticado(user, psicologoId);
        return agendaService.listarSlots(user.userId(), inicio, fim, status);
    }

    @PatchMapping("/{psicologoId}/agenda/slots/{slotId}/bloquear")
    public SlotConsultaResponse bloquearSlotLegado(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long psicologoId,
            @PathVariable Long slotId,
            @Valid @RequestBody(required = false) BloquearSlotRequest request
    ) {
        validarPsicologoAutenticado(user, psicologoId);
        return agendaService.bloquearSlot(user.userId(), slotId, request == null ? new BloquearSlotRequest(null) : request);
    }

    @PatchMapping("/{psicologoId}/agenda/slots/{slotId}/cancelar")
    public SlotConsultaResponse cancelarSlotLegado(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long psicologoId,
            @PathVariable Long slotId
    ) {
        validarPsicologoAutenticado(user, psicologoId);
        return agendaService.cancelarSlot(user.userId(), slotId);
    }

    private void validarPsicologoAutenticado(AuthenticatedUser user, Long psicologoId) {
        if (!user.isPsicologo() || !user.userId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Voce nao tem permissao para acessar esta agenda");
        }
    }
}
