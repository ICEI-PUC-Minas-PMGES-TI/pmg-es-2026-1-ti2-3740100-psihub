package psihub.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import psihub.domain.enums.StatusConsulta;
import psihub.domain.model.Consulta;
import psihub.domain.model.ProntuarioSessao;
import psihub.domain.model.RegistroEmocional;
import psihub.dtos.sessoes.EncerrarSessaoRequest;
import psihub.dtos.sessoes.IniciarSessaoRequest;
import psihub.dtos.sessoes.LinhaTempoSessaoResponse;
import psihub.dtos.sessoes.PreparacaoSessaoResponse;
import psihub.dtos.sessoes.ProntuarioSessaoResponse;
import psihub.dtos.sessoes.RegistroEmocionalResponse;
import psihub.dtos.sessoes.ResumoEmocionalResponse;
import psihub.dtos.sessoes.SalvarRascunhoSessaoRequest;
import psihub.exceptions.ApiException;
import psihub.mappers.ApiResponseMapper;
import psihub.mappers.JsonListMapper;
import psihub.repositories.ConsultaRepository;
import psihub.repositories.ProntuarioSessaoRepository;
import psihub.repositories.RegistroEmocionalRepository;

@Service
public class SessaoService {

    private final ConsultaRepository consultaRepository;
    private final ProntuarioSessaoRepository prontuarioSessaoRepository;
    private final RegistroEmocionalRepository registroEmocionalRepository;
    private final ApiResponseMapper mapper;
    private final JsonListMapper jsonListMapper;

    public SessaoService(
            ConsultaRepository consultaRepository,
            ProntuarioSessaoRepository prontuarioSessaoRepository,
            RegistroEmocionalRepository registroEmocionalRepository,
            ApiResponseMapper mapper,
            JsonListMapper jsonListMapper
    ) {
        this.consultaRepository = consultaRepository;
        this.prontuarioSessaoRepository = prontuarioSessaoRepository;
        this.registroEmocionalRepository = registroEmocionalRepository;
        this.mapper = mapper;
        this.jsonListMapper = jsonListMapper;
    }

    @Transactional(readOnly = true)
    public PreparacaoSessaoResponse preparar(Long consultaId) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        ResumoEmocionalResponse resumo = montarResumoEmocional(consulta);
        ProntuarioSessaoResponse prontuario = prontuarioSessaoRepository.findByConsultaId(consultaId)
                .map(mapper::toResponse)
                .orElse(null);

        return new PreparacaoSessaoResponse(mapper.toResponse(consulta), resumo, prontuario);
    }

    @Transactional
    public ProntuarioSessaoResponse iniciar(Long consultaId, IniciarSessaoRequest request) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        validarConsultaPodeIniciar(consulta);

        LocalDateTime inicio = request.iniciadoEm() == null ? LocalDateTime.now() : request.iniciadoEm();
        if (inicio.isAfter(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Hora de inicio nao pode ser futura");
        }

        consulta.setIniciadoEm(inicio);
        consulta.setStatus(StatusConsulta.EM_ANDAMENTO);

        ProntuarioSessao prontuario = buscarOuCriarProntuario(consulta);
        prontuario.setObservacoesPreSessao(request.observacoesPreSessao());

        return mapper.toResponse(prontuarioSessaoRepository.save(prontuario));
    }

    @Transactional
    public ProntuarioSessaoResponse salvarRascunho(Long consultaId, SalvarRascunhoSessaoRequest request) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        validarConsultaEditavel(consulta);

        ProntuarioSessao prontuario = buscarOuCriarProntuario(consulta);
        prontuario.setAnotacoesClinicas(request.anotacoesClinicas());
        prontuario.setTemasSessao(jsonListMapper.toJson(request.temasSessao()));
        prontuario.setNivelEngajamento(request.nivelEngajamento());
        prontuario.setIntercorrencias(request.intercorrencias());

        return mapper.toResponse(prontuarioSessaoRepository.save(prontuario));
    }

    @Transactional
    public ProntuarioSessaoResponse encerrar(Long consultaId, EncerrarSessaoRequest request) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);

        if (consulta.getStatus() != StatusConsulta.EM_ANDAMENTO) {
            throw new ApiException(HttpStatus.CONFLICT, "Sessao precisa estar em andamento para ser encerrada");
        }

        if (consulta.getIniciadoEm() == null) {
            throw new ApiException(HttpStatus.CONFLICT, "Sessao precisa possuir hora de inicio");
        }

        LocalDateTime encerramento = request.finalizadoEm() == null ? LocalDateTime.now() : request.finalizadoEm();
        if (encerramento.isAfter(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Hora de encerramento nao pode ser futura");
        }

        if (!encerramento.isAfter(consulta.getIniciadoEm())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Hora de encerramento deve ser posterior ao inicio");
        }

        ProntuarioSessao prontuario = buscarOuCriarProntuario(consulta);
        prontuario.setAnotacoesClinicas(request.anotacoesClinicas());
        prontuario.setTemasSessao(jsonListMapper.toJson(request.temasSessao()));
        prontuario.setNivelEngajamento(request.nivelEngajamento());
        prontuario.setIntercorrencias(request.intercorrencias());
        prontuario.setEvolucaoClinica(request.evolucaoClinica());
        prontuario.setIntervencoes(jsonListMapper.toJson(request.intervencoes()));
        prontuario.setTarefasEncaminhamentos(request.tarefasEncaminhamentos());
        prontuario.setNivelProgresso(request.nivelProgresso());
        prontuario.setIncluirLinhaTempo(request.incluirLinhaTempo() == null || request.incluirLinhaTempo());

        consulta.setFinalizadoEm(encerramento);
        consulta.setStatus(StatusConsulta.CONCLUIDA);

        return mapper.toResponse(prontuarioSessaoRepository.save(prontuario));
    }

    @Transactional(readOnly = true)
    public List<LinhaTempoSessaoResponse> linhaTempo(
            Long pacienteId,
            Long psicologoId,
            LocalDate inicio,
            LocalDate fim,
            String tema
    ) {
        LocalDate dataInicio = inicio == null ? LocalDate.now().minusDays(30) : inicio;
        LocalDate dataFim = fim == null ? LocalDate.now().plusDays(1) : fim;

        if (dataFim.isBefore(dataInicio)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Data final deve ser posterior ou igual a inicial");
        }

        return prontuarioSessaoRepository.findLinhaTempo(
                        pacienteId,
                        psicologoId,
                        dataInicio.atStartOfDay(),
                        dataFim.plusDays(1).atStartOfDay(),
                        normalizarTema(tema)
                )
                .stream()
                .map(mapper::toLinhaTempoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProntuarioSessaoResponse detalharProntuario(Long prontuarioId) {
        ProntuarioSessao prontuario = prontuarioSessaoRepository.findDetailedById(prontuarioId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Prontuario nao encontrado"));

        return mapper.toResponse(prontuario);
    }

    private ResumoEmocionalResponse montarResumoEmocional(Consulta consulta) {
        LocalDateTime fimPeriodo = consulta.getSlotConsulta().getInicioEm();
        LocalDateTime inicioPeriodo = consultaRepository
                .findFirstByPacienteIdAndPsicologoIdAndSlotConsultaInicioEmBeforeAndStatusOrderBySlotConsultaInicioEmDesc(
                        consulta.getPaciente().getId(),
                        consulta.getPsicologo().getId(),
                        fimPeriodo,
                        StatusConsulta.CONCLUIDA
                )
                .map(anterior -> anterior.getFinalizadoEm() == null
                        ? anterior.getSlotConsulta().getFimEm()
                        : anterior.getFinalizadoEm())
                .orElse(fimPeriodo.minusDays(30));

        List<RegistroEmocional> registros = registroEmocionalRepository
                .findByPacienteIdAndRegistradoEmBetweenOrderByRegistradoEmAsc(
                        consulta.getPaciente().getId(),
                        inicioPeriodo,
                        fimPeriodo
                );

        List<RegistroEmocionalResponse> registrosResponse = registros.stream()
                .map(mapper::toResponse)
                .toList();

        Double mediaHumor = registros.isEmpty()
                ? null
                : registros.stream().mapToInt(RegistroEmocional::getHumorDia).average().orElse(0);
        Integer menorHumor = registros.stream()
                .map(RegistroEmocional::getHumorDia)
                .min(Comparator.naturalOrder())
                .orElse(null);
        Integer maiorHumor = registros.stream()
                .map(RegistroEmocional::getHumorDia)
                .max(Comparator.naturalOrder())
                .orElse(null);

        return new ResumoEmocionalResponse(
                consulta.getPaciente().getId(),
                inicioPeriodo,
                fimPeriodo,
                registros.size(),
                mediaHumor,
                menorHumor,
                maiorHumor,
                registrosResponse
        );
    }

    private Consulta buscarConsultaDetalhada(Long consultaId) {
        return consultaRepository.findDetailedById(consultaId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Consulta nao encontrada"));
    }

    private ProntuarioSessao buscarOuCriarProntuario(Consulta consulta) {
        return prontuarioSessaoRepository.findByConsultaId(consulta.getId())
                .orElseGet(() -> {
                    ProntuarioSessao prontuario = new ProntuarioSessao();
                    prontuario.setConsulta(consulta);
                    return prontuario;
                });
    }

    private void validarConsultaPodeIniciar(Consulta consulta) {
        validarConsultaEditavel(consulta);

        if (consulta.getSlotConsulta().getInicioEm().toLocalDate().isAfter(LocalDate.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nao e permitido iniciar sessao de consulta futura");
        }

        if (consulta.getStatus() != StatusConsulta.AGENDADA
                && consulta.getStatus() != StatusConsulta.CONFIRMADA
                && consulta.getStatus() != StatusConsulta.EM_ANDAMENTO) {
            throw new ApiException(HttpStatus.CONFLICT, "Consulta nao esta em status valido para iniciar sessao");
        }
    }

    private void validarConsultaEditavel(Consulta consulta) {
        if (consulta.getStatus() == StatusConsulta.CANCELADA
                || consulta.getStatus() == StatusConsulta.CONCLUIDA
                || consulta.getStatus() == StatusConsulta.FALTOU) {
            throw new ApiException(HttpStatus.CONFLICT, "Consulta nao permite alteracao de sessao neste status");
        }
    }

    private String normalizarTema(String tema) {
        if (tema == null || tema.isBlank()) {
            return null;
        }
        return tema.trim();
    }
}
