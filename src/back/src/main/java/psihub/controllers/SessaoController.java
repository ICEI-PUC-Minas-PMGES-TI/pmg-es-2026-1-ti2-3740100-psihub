package psihub.controllers;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import psihub.dtos.sessoes.EncerrarSessaoRequest;
import psihub.dtos.sessoes.IniciarSessaoRequest;
import psihub.dtos.sessoes.LinhaTempoSessaoResponse;
import psihub.dtos.sessoes.PreparacaoSessaoResponse;
import psihub.dtos.sessoes.ProntuarioSessaoResponse;
import psihub.dtos.sessoes.SalvarRascunhoSessaoRequest;
import psihub.services.SessaoService;

@RestController
@RequestMapping("/api")
public class SessaoController {

    private final SessaoService sessaoService;

    public SessaoController(SessaoService sessaoService) {
        this.sessaoService = sessaoService;
    }

    @GetMapping("/consultas/{consultaId}/sessao/preparacao")
    public PreparacaoSessaoResponse preparar(@PathVariable Long consultaId) {
        return sessaoService.preparar(consultaId);
    }

    @PostMapping("/consultas/{consultaId}/sessao/iniciar")
    public ProntuarioSessaoResponse iniciar(
            @PathVariable Long consultaId,
            @Valid @RequestBody(required = false) IniciarSessaoRequest request
    ) {
        return sessaoService.iniciar(
                consultaId,
                request == null ? new IniciarSessaoRequest(null, null) : request
        );
    }

    @PutMapping("/consultas/{consultaId}/sessao/rascunho")
    public ProntuarioSessaoResponse salvarRascunho(
            @PathVariable Long consultaId,
            @Valid @RequestBody SalvarRascunhoSessaoRequest request
    ) {
        return sessaoService.salvarRascunho(consultaId, request);
    }

    @PostMapping("/consultas/{consultaId}/sessao/encerrar")
    public ProntuarioSessaoResponse encerrar(
            @PathVariable Long consultaId,
            @Valid @RequestBody EncerrarSessaoRequest request
    ) {
        return sessaoService.encerrar(consultaId, request);
    }

    @GetMapping("/pacientes/{pacienteId}/linha-do-tempo")
    public List<LinhaTempoSessaoResponse> linhaTempo(
            @PathVariable Long pacienteId,
            @RequestParam Long psicologoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) String tema
    ) {
        return sessaoService.linhaTempo(pacienteId, psicologoId, inicio, fim, tema);
    }

    @GetMapping("/prontuarios/{prontuarioId}")
    public ProntuarioSessaoResponse detalharProntuario(@PathVariable Long prontuarioId) {
        return sessaoService.detalharProntuario(prontuarioId);
    }
}
