package com.psihub.api.modules.sessoes.service;

import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.consultas.service.ConsultaService;
import com.psihub.api.modules.registros.entity.RegistroEmocional;
import com.psihub.api.modules.registros.service.RegistroEmocionalService;
import com.psihub.api.modules.sessoes.dto.CriarEvolutaoClinicaRequest;
import com.psihub.api.modules.sessoes.dto.EncerrarSessaoRequest;
import com.psihub.api.modules.sessoes.dto.EvolutaoClinicaResponse;
import com.psihub.api.modules.sessoes.dto.IniciarSessaoRequest;
import com.psihub.api.modules.sessoes.dto.LinhaTempoSessaoResponse;
import com.psihub.api.modules.sessoes.dto.PreparacaoSessaoResponse;
import com.psihub.api.modules.sessoes.dto.ProntuarioSessaoResponse;
import com.psihub.api.modules.sessoes.dto.RegistroEmocionalResponse;
import com.psihub.api.modules.sessoes.dto.ResumoEmocionalResponse;
import com.psihub.api.modules.sessoes.dto.SalvarRascunhoSessaoRequest;
import com.psihub.api.modules.sessoes.entity.EvolutaoClinica;
import com.psihub.api.modules.sessoes.entity.ProntuarioSessao;
import com.psihub.api.modules.sessoes.repository.EvolutaoClinicaRepository;
import com.psihub.api.modules.sessoes.repository.ProntuarioSessaoRepository;
import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.modules.vinculos.service.VinculoService;
import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import com.psihub.api.shared.utils.ApiResponseMapper;
import com.psihub.api.shared.utils.JsonListMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessaoService {

    private final ConsultaService consultaService;
    private final ProntuarioSessaoRepository prontuarioSessaoRepository;
    private final EvolutaoClinicaRepository evolutaoClinicaRepository;
    private final RegistroEmocionalService registroEmocionalService;
    private final PacienteService pacienteService;
    private final PsicologoService psicologoService;
    private final ApiResponseMapper mapper;
    private final JsonListMapper jsonListMapper;
    private final VinculoService vinculoService;

    public SessaoService(
            ConsultaService consultaService,
            ProntuarioSessaoRepository prontuarioSessaoRepository,
            EvolutaoClinicaRepository evolutaoClinicaRepository,
            RegistroEmocionalService registroEmocionalService,
            PacienteService pacienteService,
            PsicologoService psicologoService,
            ApiResponseMapper mapper,
            JsonListMapper jsonListMapper,
            VinculoService vinculoService
    ) {
        this.consultaService = consultaService;
        this.prontuarioSessaoRepository = prontuarioSessaoRepository;
        this.evolutaoClinicaRepository = evolutaoClinicaRepository;
        this.registroEmocionalService = registroEmocionalService;
        this.pacienteService = pacienteService;
        this.psicologoService = psicologoService;
        this.mapper = mapper;
        this.jsonListMapper = jsonListMapper;
        this.vinculoService = vinculoService;
    }

    public void exigirPsicologo(AuthenticatedUser user) {
        if (!user.isPsicologo()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas psicologos podem acessar prontuarios e sessoes");
        }
    }

    @Transactional(readOnly = true)
    public PreparacaoSessaoResponse preparar(Long consultaId) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        return montarPreparacao(consulta, consultaId);
    }

    @Transactional(readOnly = true)
    public PreparacaoSessaoResponse prepararComoPsicologo(Long consultaId, Long psicologoId) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        validarPsicologoDaConsulta(consulta, psicologoId);
        validarVinculoClinico(consulta, psicologoId);
        return montarPreparacao(consulta, consultaId);
    }

    private PreparacaoSessaoResponse montarPreparacao(Consulta consulta, Long consultaId) {
        ResumoEmocionalResponse resumo = montarResumoEmocional(consulta);
        ProntuarioSessaoResponse prontuario = prontuarioSessaoRepository.findByConsultaId(consultaId)
                .map(mapper::toResponse)
                .orElse(null);

        return new PreparacaoSessaoResponse(mapper.toResponse(consulta), resumo, prontuario);
    }

    @Transactional
    public ProntuarioSessaoResponse iniciar(Long consultaId, IniciarSessaoRequest request) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        return iniciarConsulta(consulta, request);
    }

    @Transactional
    public ProntuarioSessaoResponse iniciarComoPsicologo(Long consultaId, Long psicologoId, IniciarSessaoRequest request) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        validarPsicologoDaConsulta(consulta, psicologoId);
        validarVinculoClinico(consulta, psicologoId);
        return iniciarConsulta(consulta, request);
    }

    private ProntuarioSessaoResponse iniciarConsulta(Consulta consulta, IniciarSessaoRequest request) {
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
        return salvarRascunhoConsulta(consulta, request);
    }

    @Transactional
    public ProntuarioSessaoResponse salvarRascunhoComoPsicologo(
            Long consultaId,
            Long psicologoId,
            SalvarRascunhoSessaoRequest request
    ) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        validarPsicologoDaConsulta(consulta, psicologoId);
        validarVinculoClinico(consulta, psicologoId);
        return salvarRascunhoConsulta(consulta, request);
    }

    private ProntuarioSessaoResponse salvarRascunhoConsulta(Consulta consulta, SalvarRascunhoSessaoRequest request) {
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
        return encerrarConsulta(consulta, request);
    }

    @Transactional
    public ProntuarioSessaoResponse encerrarComoPsicologo(Long consultaId, Long psicologoId, EncerrarSessaoRequest request) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        validarPsicologoDaConsulta(consulta, psicologoId);
        validarVinculoClinico(consulta, psicologoId);
        return encerrarConsulta(consulta, request);
    }

    private ProntuarioSessaoResponse encerrarConsulta(Consulta consulta, EncerrarSessaoRequest request) {

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
        vinculoService.exigirVinculoAceito(pacienteId, psicologoId);
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

    @Transactional(readOnly = true)
    public ProntuarioSessaoResponse detalharProntuarioComoPsicologo(Long prontuarioId, Long psicologoId) {
        ProntuarioSessao prontuario = prontuarioSessaoRepository.findDetailedById(prontuarioId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Prontuario nao encontrado"));
        validarPsicologoDaConsulta(prontuario.getConsulta(), psicologoId);
        validarVinculoClinico(prontuario.getConsulta(), psicologoId);

        return mapper.toResponse(prontuario);
    }

    @Transactional
    public EvolutaoClinicaResponse criarEvolutaoClinica(Long psicologoId, CriarEvolutaoClinicaRequest request) {
        vinculoService.exigirVinculoAceito(request.pacienteId(), psicologoId);

        Paciente paciente = pacienteService.buscarPorId(request.pacienteId());
        Psicologo psicologo = psicologoService.buscarPorId(psicologoId);

        EvolutaoClinica evolucao = new EvolutaoClinica();
        evolucao.setPaciente(paciente);
        evolucao.setPsicologo(psicologo);
        evolucao.setTitulo(request.titulo());
        evolucao.setTemasSessao(jsonListMapper.toJson(request.temasSessao()));
        evolucao.setAnotacoesClinicas(request.anotacoesClinicas());
        evolucao.setNivelEngajamento(request.nivelEngajamento());
        evolucao.setNivelProgresso(request.nivelProgresso());
        evolucao.setIntercorrencias(request.intercorrencias());
        evolucao.setTarefasEncaminhamentos(request.tarefasEncaminhamentos());

        EvolutaoClinica salva = evolutaoClinicaRepository.save(evolucao);

        return new EvolutaoClinicaResponse(
            salva.getId(),
            salva.getPaciente().getId(),
            salva.getCriadoEm(),
            salva.getTitulo(),
            jsonListMapper.fromJson(salva.getTemasSessao()),
            salva.getNivelProgresso(),
            salva.getNivelEngajamento(),
            salva.getAnotacoesClinicas(),
            salva.getIntercorrencias(),
            salva.getTarefasEncaminhamentos()
        );
    }

    @Transactional(readOnly = true)
    public List<EvolutaoClinicaResponse> listarEvolucoesClinicas(Long psicologoId, Long pacienteId) {
        vinculoService.exigirVinculoAceito(pacienteId, psicologoId);

        return evolutaoClinicaRepository.findByPacienteIdAndAtivoTrueOrderByCriadoEmDesc(pacienteId)
                .stream()
                .filter(evolucao -> evolucao.getPsicologo().getId().equals(psicologoId))
                .map(evolucao -> new EvolutaoClinicaResponse(
                        evolucao.getId(),
                        evolucao.getPaciente().getId(),
                        evolucao.getCriadoEm(),
                        evolucao.getTitulo(),
                        jsonListMapper.fromJson(evolucao.getTemasSessao()),
                        evolucao.getNivelProgresso(),
                        evolucao.getNivelEngajamento(),
                        evolucao.getAnotacoesClinicas(),
                        evolucao.getIntercorrencias(),
                        evolucao.getTarefasEncaminhamentos()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public EvolutaoClinicaResponse buscarEvolutaoClinica(Long psicologoId, Long evolucaoId) {
        EvolutaoClinica evolucao = evolutaoClinicaRepository.findById(java.util.Objects.requireNonNull(evolucaoId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Evolucao clinica nao encontrada"));
        if (!evolucao.getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Evolucao clinica nao encontrada");
        }
        vinculoService.exigirVinculoAceito(evolucao.getPaciente().getId(), psicologoId);
        return new EvolutaoClinicaResponse(
                evolucao.getId(),
                evolucao.getPaciente().getId(),
                evolucao.getCriadoEm(),
                evolucao.getTitulo(),
                jsonListMapper.fromJson(evolucao.getTemasSessao()),
                evolucao.getNivelProgresso(),
                evolucao.getNivelEngajamento(),
                evolucao.getAnotacoesClinicas(),
                evolucao.getIntercorrencias(),
                evolucao.getTarefasEncaminhamentos()
        );
    }

    private ResumoEmocionalResponse montarResumoEmocional(Consulta consulta) {
        LocalDateTime fimPeriodo = consulta.getInicioEm();
        LocalDateTime inicioPeriodo = consultaService
                .buscarConsultaAnteriorConcluida(
                        consulta.getPaciente().getId(),
                        consulta.getPsicologo().getId(),
                        fimPeriodo
                )
                .map(anterior -> anterior.getFinalizadoEm() == null
                    ? anterior.getFimEm()
                        : anterior.getFinalizadoEm())
                .orElse(fimPeriodo.minusDays(30));

        List<RegistroEmocional> registros = registroEmocionalService
                .buscarPorPacienteEPeriodo(
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
        return consultaService.buscarConsultaDetalhada(consultaId);
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

        if (consulta.getInicioEm().toLocalDate().isAfter(LocalDate.now())) {
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

    private void validarPsicologoDaConsulta(Consulta consulta, Long psicologoId) {
        if (!consulta.getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Consulta nao encontrada");
        }
    }

    private void validarVinculoClinico(Consulta consulta, Long psicologoId) {
        vinculoService.exigirVinculoAceito(consulta.getPaciente().getId(), psicologoId);
    }

    private String normalizarTema(String tema) {
        if (tema == null || tema.isBlank()) {
            return null;
        }
        return tema.trim();
    }
}
