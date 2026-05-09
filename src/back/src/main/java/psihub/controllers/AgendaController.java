package psihub.controllers;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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
import psihub.services.AgendaService;

@RestController
@RequestMapping("/api/psicologos/{psicologoId}")
public class AgendaController {

    private final AgendaService agendaService;

    public AgendaController(AgendaService agendaService) {
        this.agendaService = agendaService;
    }

    @PostMapping("/disponibilidades")
    @ResponseStatus(HttpStatus.CREATED)
    public DisponibilidadeResponse definirDisponibilidade(
            @PathVariable Long psicologoId,
            @Valid @RequestBody DefinirDisponibilidadeRequest request
    ) {
        return agendaService.definirDisponibilidade(psicologoId, request);
    }

    @GetMapping("/disponibilidades")
    public List<RegraDisponibilidadeResponse> listarRegras(@PathVariable Long psicologoId) {
        return agendaService.listarRegras(psicologoId);
    }

    @PostMapping("/agenda/slots")
    @ResponseStatus(HttpStatus.CREATED)
    public SlotConsultaResponse criarSlotManual(
            @PathVariable Long psicologoId,
            @Valid @RequestBody CriarSlotManualRequest request
    ) {
        return agendaService.criarSlotManual(psicologoId, request);
    }

    @GetMapping("/agenda/slots")
    public List<SlotConsultaResponse> listarSlots(
            @PathVariable Long psicologoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(required = false) StatusSlotConsulta status
    ) {
        return agendaService.listarSlots(psicologoId, inicio, fim, status);
    }

    @GetMapping("/agenda/slots/disponiveis")
    public List<SlotConsultaResponse> listarSlotsDisponiveis(
            @PathVariable Long psicologoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        return agendaService.listarSlotsDisponiveis(psicologoId, data);
    }

    @PatchMapping("/agenda/slots/{slotId}/bloquear")
    public SlotConsultaResponse bloquearSlot(
            @PathVariable Long psicologoId,
            @PathVariable Long slotId,
            @Valid @RequestBody(required = false) BloquearSlotRequest request
    ) {
        return agendaService.bloquearSlot(
                psicologoId,
                slotId,
                request == null ? new BloquearSlotRequest(null) : request
        );
    }

    @PatchMapping("/agenda/slots/{slotId}/cancelar")
    public SlotConsultaResponse cancelarSlot(
            @PathVariable Long psicologoId,
            @PathVariable Long slotId
    ) {
        return agendaService.cancelarSlot(psicologoId, slotId);
    }
}
