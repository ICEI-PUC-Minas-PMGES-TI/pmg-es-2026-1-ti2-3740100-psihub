package com.psihub.api.modules.indicadores.controller;

import com.psihub.api.modules.indicadores.dto.ConsultasMensaisPacienteResponse;
import com.psihub.api.modules.indicadores.dto.IndicadoresDesempenhoResponse;
import com.psihub.api.modules.indicadores.dto.NotaMediaConsultasIndicadorResponse;
import com.psihub.api.modules.indicadores.dto.PagamentosEfetuadosIndicadorResponse;
import com.psihub.api.modules.indicadores.dto.RetornoPacientesIndicadorResponse;
import com.psihub.api.modules.indicadores.service.IndicadoresService;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/psicologos/me/indicadores")
public class IndicadoresController {

    private final IndicadoresService indicadoresService;

    public IndicadoresController(IndicadoresService indicadoresService) {
        this.indicadoresService = indicadoresService;
    }

    @GetMapping
    public IndicadoresDesempenhoResponse resumo(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return indicadoresService.resumo(user.userId(), inicio, fim);
    }

    @GetMapping("/pagamentos-efetuados")
    public PagamentosEfetuadosIndicadorResponse pagamentosEfetuados(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return indicadoresService.pagamentosEfetuados(user.userId(), inicio, fim);
    }

    @GetMapping("/nota-media-consultas")
    public NotaMediaConsultasIndicadorResponse notaMediaConsultas(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return indicadoresService.notaMediaConsultas(user.userId(), inicio, fim);
    }

    @GetMapping("/retorno-pacientes")
    public RetornoPacientesIndicadorResponse retornoPacientes(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return indicadoresService.retornoPacientes(user.userId(), inicio, fim);
    }

    @GetMapping("/consultas-mensais-pacientes")
    public List<ConsultasMensaisPacienteResponse> consultasMensaisPorPaciente(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return indicadoresService.consultasPorMesPorPaciente(user.userId(), inicio, fim);
    }
}
