package com.psihub.api.modules.indicadores.service;

import com.psihub.api.modules.avaliacoes.repository.AvaliacaoRepository;
import com.psihub.api.modules.consultas.repository.ConsultaRepository;
import com.psihub.api.modules.financeiro.repository.PagamentoRepository;
import com.psihub.api.modules.indicadores.dto.ConsultasMensaisPacienteProjection;
import com.psihub.api.modules.indicadores.dto.ConsultasMensaisPacienteResponse;
import com.psihub.api.modules.indicadores.dto.IndicadoresDesempenhoResponse;
import com.psihub.api.modules.indicadores.dto.NotaMediaConsultasIndicadorResponse;
import com.psihub.api.modules.indicadores.dto.PagamentosEfetuadosIndicadorResponse;
import com.psihub.api.modules.indicadores.dto.RetornoPacientesIndicadorResponse;
import com.psihub.api.shared.exception.ApiException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IndicadoresService {

    private final PagamentoRepository pagamentoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final ConsultaRepository consultaRepository;

    public IndicadoresService(
            PagamentoRepository pagamentoRepository,
            AvaliacaoRepository avaliacaoRepository,
            ConsultaRepository consultaRepository
    ) {
        this.pagamentoRepository = pagamentoRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.consultaRepository = consultaRepository;
    }

    @Transactional(readOnly = true)
    public IndicadoresDesempenhoResponse resumo(Long psicologoId, LocalDate inicio, LocalDate fim) {
        Periodo periodo = resolverPeriodo(inicio, fim);
        return new IndicadoresDesempenhoResponse(
                periodo.inicio(),
                periodo.fim(),
                pagamentosEfetuados(psicologoId, periodo),
                notaMediaConsultas(psicologoId, periodo),
                retornoPacientes(psicologoId, periodo),
                consultasPorMesPorPaciente(psicologoId, periodo)
        );
    }

    @Transactional(readOnly = true)
    public PagamentosEfetuadosIndicadorResponse pagamentosEfetuados(Long psicologoId, LocalDate inicio, LocalDate fim) {
        return pagamentosEfetuados(psicologoId, resolverPeriodo(inicio, fim));
    }

    @Transactional(readOnly = true)
    public NotaMediaConsultasIndicadorResponse notaMediaConsultas(Long psicologoId, LocalDate inicio, LocalDate fim) {
        return notaMediaConsultas(psicologoId, resolverPeriodo(inicio, fim));
    }

    @Transactional(readOnly = true)
    public RetornoPacientesIndicadorResponse retornoPacientes(Long psicologoId, LocalDate inicio, LocalDate fim) {
        return retornoPacientes(psicologoId, resolverPeriodo(inicio, fim));
    }

    @Transactional(readOnly = true)
    public List<ConsultasMensaisPacienteResponse> consultasPorMesPorPaciente(
            Long psicologoId,
            LocalDate inicio,
            LocalDate fim
    ) {
        return consultasPorMesPorPaciente(psicologoId, resolverPeriodo(inicio, fim));
    }

    private PagamentosEfetuadosIndicadorResponse pagamentosEfetuados(Long psicologoId, Periodo periodo) {
        long total = pagamentoRepository.countByPsicologoAndPeriodo(
                psicologoId,
                periodo.inicioEm(),
                periodo.fimExclusivo()
        );
        long pagos = pagamentoRepository.countPagosByPsicologoAndPeriodo(
                psicologoId,
                periodo.inicioEm(),
                periodo.fimExclusivo()
        );

        return new PagamentosEfetuadosIndicadorResponse(total, pagos, percentual(pagos, total));
    }

    private NotaMediaConsultasIndicadorResponse notaMediaConsultas(Long psicologoId, Periodo periodo) {
        Double media = avaliacaoRepository.avgNotaByPsicologoAndPeriodo(
                psicologoId,
                periodo.inicioEm(),
                periodo.fimExclusivo()
        );
        long total = avaliacaoRepository.countByPsicologoAndPeriodo(
                psicologoId,
                periodo.inicioEm(),
                periodo.fimExclusivo()
        );

        return new NotaMediaConsultasIndicadorResponse(media == null ? 0.0 : media, total);
    }

    private RetornoPacientesIndicadorResponse retornoPacientes(Long psicologoId, Periodo periodo) {
        long total = consultaRepository.countPacientesComConsultaConcluida(
                psicologoId,
                periodo.inicioEm(),
                periodo.fimExclusivo()
        );
        long retorno = consultaRepository.countPacientesComRetorno(
                psicologoId,
                periodo.inicioEm(),
                periodo.fimExclusivo()
        );

        return new RetornoPacientesIndicadorResponse(total, retorno, percentual(retorno, total));
    }

    private List<ConsultasMensaisPacienteResponse> consultasPorMesPorPaciente(Long psicologoId, Periodo periodo) {
        return consultaRepository.findConsultasMensaisPorPaciente(
                        psicologoId,
                        periodo.inicioEm(),
                        periodo.fimExclusivo()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ConsultasMensaisPacienteResponse toResponse(ConsultasMensaisPacienteProjection projection) {
        return new ConsultasMensaisPacienteResponse(
                projection.getPacienteId(),
                projection.getPacienteNome(),
                projection.getAno().intValue(),
                projection.getMes().intValue(),
                projection.getTotalConsultas().longValue()
        );
    }

    private Periodo resolverPeriodo(LocalDate inicio, LocalDate fim) {
        LocalDate dataInicio = inicio == null ? LocalDate.now().withDayOfMonth(1) : inicio;
        LocalDate dataFim = fim == null ? LocalDate.now() : fim;

        if (dataFim.isBefore(dataInicio)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Data final deve ser posterior ou igual a inicial");
        }

        return new Periodo(
                dataInicio,
                dataFim,
                dataInicio.atStartOfDay(),
                dataFim.plusDays(1).atStartOfDay()
        );
    }

    private double percentual(long parte, long total) {
        if (total == 0) {
            return 0.0;
        }
        return (parte * 100.0) / total;
    }

    private record Periodo(
            LocalDate inicio,
            LocalDate fim,
            LocalDateTime inicioEm,
            LocalDateTime fimExclusivo
    ) {}
}
