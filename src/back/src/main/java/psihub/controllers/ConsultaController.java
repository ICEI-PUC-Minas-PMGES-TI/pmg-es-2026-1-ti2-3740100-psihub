package psihub.controllers;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import psihub.domain.enums.StatusConsulta;
import psihub.dtos.consultas.AgendarConsultaRequest;
import psihub.dtos.consultas.CancelarConsultaRequest;
import psihub.dtos.consultas.ConsultaResponse;
import psihub.exceptions.ApiException;
import psihub.security.AuthenticatedUser;
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
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas psicologos podem confirmar consultas");
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
}
