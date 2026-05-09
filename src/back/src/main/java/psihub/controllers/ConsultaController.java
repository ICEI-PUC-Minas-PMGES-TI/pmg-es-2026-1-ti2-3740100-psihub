package psihub.controllers;

import jakarta.validation.Valid;
import java.time.LocalDate;
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
import psihub.domain.enums.StatusConsulta;
import psihub.dtos.consultas.AgendarConsultaRequest;
import psihub.dtos.consultas.CancelarConsultaRequest;
import psihub.dtos.consultas.ConsultaResponse;
import psihub.services.ConsultaService;

@RestController
@RequestMapping("/api/consultas")
public class ConsultaController {

    private final ConsultaService consultaService;

    public ConsultaController(ConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @PostMapping("/agendamentos")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsultaResponse agendar(@Valid @RequestBody AgendarConsultaRequest request) {
        return consultaService.agendar(request);
    }

    @GetMapping
    public List<ConsultaResponse> listar(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) Long psicologoId,
            @RequestParam(required = false) StatusConsulta status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return consultaService.listar(pacienteId, psicologoId, status, inicio, fim);
    }

    @GetMapping("/{consultaId}")
    public ConsultaResponse detalhar(@PathVariable Long consultaId) {
        return consultaService.detalhar(consultaId);
    }

    @PatchMapping("/{consultaId}/confirmar")
    public ConsultaResponse confirmar(@PathVariable Long consultaId) {
        return consultaService.confirmar(consultaId);
    }

    @PatchMapping("/{consultaId}/cancelar")
    public ConsultaResponse cancelar(
            @PathVariable Long consultaId,
            @Valid @RequestBody(required = false) CancelarConsultaRequest request
    ) {
        return consultaService.cancelar(
                consultaId,
                request == null ? new CancelarConsultaRequest(null) : request
        );
    }
}
