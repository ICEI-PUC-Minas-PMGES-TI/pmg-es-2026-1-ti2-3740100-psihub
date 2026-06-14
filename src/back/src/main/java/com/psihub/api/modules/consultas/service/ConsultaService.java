package com.psihub.api.modules.consultas.service;

import com.psihub.api.modules.agenda.dto.HorarioDisponivelDTO;
import com.psihub.api.modules.agenda.service.AgendaService;
import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.auth.service.AuthService;
import com.psihub.api.modules.consultas.dto.AgendarConsultaRequest;
import com.psihub.api.modules.consultas.dto.AgendarPorPsicologoRequest;
import com.psihub.api.modules.consultas.dto.AgendarRecorrenciaRequest;
import com.psihub.api.modules.consultas.dto.AtualizarConsultaRequest;
import com.psihub.api.modules.consultas.dto.AtualizarStatusConsultaRequest;
import com.psihub.api.modules.consultas.dto.CancelarConsultaRequest;
import com.psihub.api.modules.consultas.dto.ConsultaResponse;
import com.psihub.api.modules.consultas.dto.FrequenciaRecorrencia;
import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.consultas.repository.ConsultaRepository;
import com.psihub.api.modules.notificacoes.service.NotificacaoService;
import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.modules.vinculos.service.VinculoService;
import com.psihub.api.shared.enums.StatusAcesso;
import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.enums.TipoAtendimento;
import com.psihub.api.shared.enums.TipoUsuario;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.utils.ApiResponseMapper;
import com.psihub.api.shared.utils.StringUtils;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsultaService {

    private static final Collection<StatusConsulta> ACTIVE_STATUSES = List.of(
            StatusConsulta.AGENDADA, StatusConsulta.CONFIRMADA, StatusConsulta.EM_ANDAMENTO);

    private static final Collection<StatusConsulta> NON_CONFLICTING_STATUSES = List.of(
            StatusConsulta.CANCELADA, StatusConsulta.CONCLUIDA, StatusConsulta.FALTOU);

    private static final Collection<StatusConsulta> ALL_STATUSES =
            Arrays.asList(StatusConsulta.values());

    private final ConsultaRepository consultaRepository;
    private final PacienteService pacienteService;
    private final PsicologoService psicologoService;
    private final AgendaService agendaService;
    private final AuthService authService;
    private final ApiResponseMapper mapper;
    private final NotificacaoService notificacaoService;
    private final VinculoService vinculoService;

    public ConsultaService(
            ConsultaRepository consultaRepository,
            PacienteService pacienteService,
            PsicologoService psicologoService,
            AgendaService agendaService,
            AuthService authService,
            ApiResponseMapper mapper,
            NotificacaoService notificacaoService,
            VinculoService vinculoService
    ) {
        this.consultaRepository = consultaRepository;
        this.pacienteService = pacienteService;
        this.psicologoService = psicologoService;
        this.agendaService = agendaService;
        this.authService = authService;
        this.mapper = mapper;
        this.notificacaoService = notificacaoService;
        this.vinculoService = vinculoService;
    }

    @Transactional
    public ConsultaResponse agendarComoPaciente(@NonNull Long pacienteId, AgendarConsultaRequest request) {
        Paciente paciente = pacienteService.buscarPorId(pacienteId);
        Psicologo psicologo = psicologoService.buscarPorId(Objects.requireNonNull(request.psicologoId()));
        Usuario agendadoPor = authService.buscarUsuarioPorId(pacienteId);
        LocalDateTime inicioEm = Objects.requireNonNull(request.inicioEm());

        validarPsicologoAtivo(psicologo);
        IntervaloConsulta intervalo = resolverIntervaloDisponivel(psicologo.getId(), inicioEm, request.fimEm());
        validarHorarioNoPassado(intervalo.inicioEm());
        validarSemConflitoComLock(psicologo.getId(), intervalo.inicioEm(), intervalo.fimEm());
        vinculoService.garantirSolicitado(paciente.getId(), psicologo.getId());

        Consulta consulta = new Consulta();
        consulta.setPaciente(paciente);
        consulta.setPsicologo(psicologo);
        consulta.setInicioEm(intervalo.inicioEm());
        consulta.setFimEm(intervalo.fimEm());
        consulta.setAgendadoPorUsuario(agendadoPor);
        consulta.setTipoAtendimento(request.tipoAtendimento() == null ? TipoAtendimento.ONLINE : request.tipoAtendimento());
        consulta.setStatus(StatusConsulta.AGENDADA);
        consulta.setObservacoes(StringUtils.sanitizeOptional(request.observacoes()));

        return mapper.toResponse(consultaRepository.save(consulta));
    }

    @Transactional
    public ConsultaResponse agendarComoPsicologo(@NonNull Long psicologoId, AgendarPorPsicologoRequest request) {
        Psicologo psicologo = psicologoService.buscarPorId(psicologoId);
        Paciente paciente = pacienteService.buscarPorId(Objects.requireNonNull(request.pacienteId()));
        Usuario agendadoPor = authService.buscarUsuarioPorId(psicologoId);
        LocalDateTime inicioEm = Objects.requireNonNull(request.inicioEm());

        validarPsicologoAtivo(psicologo);
        IntervaloConsulta intervalo = resolverIntervaloDisponivel(psicologoId, inicioEm, request.fimEm());
        validarHorarioNoPassado(intervalo.inicioEm());
        validarSemConflitoComLock(psicologoId, intervalo.inicioEm(), intervalo.fimEm());
        vinculoService.garantirAceito(paciente.getId(), psicologoId);

        Consulta consulta = new Consulta();
        consulta.setPaciente(paciente);
        consulta.setPsicologo(psicologo);
        consulta.setInicioEm(intervalo.inicioEm());
        consulta.setFimEm(intervalo.fimEm());
        consulta.setAgendadoPorUsuario(agendadoPor);
        consulta.setTipoAtendimento(request.tipoAtendimento() == null ? TipoAtendimento.ONLINE : request.tipoAtendimento());
        consulta.setStatus(StatusConsulta.AGENDADA);
        consulta.setObservacoes(StringUtils.sanitizeOptional(request.observacoes()));

        return mapper.toResponse(consultaRepository.save(consulta));
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listar(
            Long pacienteId,
            Long psicologoId,
            StatusConsulta statusFilter,
            LocalDate inicio,
            LocalDate fim,
            boolean historico
    ) {
        Collection<StatusConsulta> statuses;
        if (statusFilter != null) {
            statuses = List.of(statusFilter);
        } else if (!historico) {
            statuses = ACTIVE_STATUSES;
        } else {
            statuses = ALL_STATUSES;
        }

        LocalDate dataInicio, dataFim;
        if (!historico) {
            dataInicio = inicio != null ? inicio : LocalDate.now();
            dataFim = fim != null ? fim : dataInicio.plusDays(90);
        } else {
            dataInicio = inicio != null ? inicio : LocalDate.now().minusDays(365);
            dataFim = fim != null ? fim : LocalDate.now().plusDays(30);
        }

        if (dataFim.isBefore(dataInicio)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Data final deve ser posterior ou igual a inicial");
        }

        return consultaRepository.findByFiltros(
                        pacienteId,
                        psicologoId,
                        statuses,
                        dataInicio.atStartOfDay(),
                        dataFim.plusDays(1).atStartOfDay()
                )
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConsultaResponse detalhar(Long consultaId) {
        return mapper.toResponse(buscarConsultaDetalhada(consultaId));
    }

    @Transactional(readOnly = true)
    public ConsultaResponse detalharComoUsuario(Long consultaId, Long userId, TipoUsuario tipoUsuario) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        validarAcessoConsulta(consulta, userId, tipoUsuario);
        return mapper.toResponse(consulta);
    }

    @Transactional
    public ConsultaResponse confirmar(Long consultaId) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);

        if (consulta.getStatus() != StatusConsulta.AGENDADA) {
            throw new ApiException(HttpStatus.CONFLICT, "Apenas consultas agendadas podem ser confirmadas");
        }

        consulta.setStatus(StatusConsulta.CONFIRMADA);
        return mapper.toResponse(consulta);
    }

    @Transactional
    public ConsultaResponse confirmarComoPsicologo(Long consultaId, Long psicologoId) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        if (!consulta.getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Consulta não encontrada");
        }

        if (consulta.getStatus() != StatusConsulta.AGENDADA) {
            throw new ApiException(HttpStatus.CONFLICT, "Apenas consultas agendadas podem ser confirmadas");
        }

        consulta.setStatus(StatusConsulta.CONFIRMADA);
        return mapper.toResponse(consulta);
    }

    @Transactional
    public ConsultaResponse cancelar(Long consultaId, CancelarConsultaRequest request) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);

        if (consulta.getStatus() == StatusConsulta.CONCLUIDA) {
            throw new ApiException(HttpStatus.CONFLICT, "Consultas concluídas não podem ser canceladas");
        }

        if (consulta.getStatus() == StatusConsulta.CANCELADA) {
            return mapper.toResponse(consulta);
        }

        consulta.setAtivo(false);
        consulta.setStatus(StatusConsulta.CANCELADA);
        consulta.setMotivoCancelamento(request == null ? null : request.motivoCancelamento());

        return mapper.toResponse(consulta);
    }

    @Transactional
    public ConsultaResponse cancelarComoUsuario(
            Long consultaId,
            Long userId,
            TipoUsuario tipoUsuario,
            CancelarConsultaRequest request
    ) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        validarAcessoConsulta(consulta, userId, tipoUsuario);

        if (consulta.getStatus() == StatusConsulta.CONCLUIDA) {
            throw new ApiException(HttpStatus.CONFLICT, "Consultas concluídas não podem ser canceladas");
        }

        if (consulta.getStatus() == StatusConsulta.CANCELADA) {
            return mapper.toResponse(consulta);
        }

        consulta.setAtivo(false);
        consulta.setStatus(StatusConsulta.CANCELADA);
        consulta.setMotivoCancelamento(request == null ? null : StringUtils.sanitizeOptional(request.motivoCancelamento()));

        if (tipoUsuario == TipoUsuario.PACIENTE) {
            notificacaoService.notificarCancelamentoParaPsicologo(consulta);
        } else if (tipoUsuario == TipoUsuario.PSICOLOGO) {
            notificacaoService.notificarCancelamentoParaPaciente(consulta);
        }

        return mapper.toResponse(consulta);
    }

    @Transactional
    public ConsultaResponse atualizarStatusComoUsuario(
            Long consultaId,
            Long userId,
            TipoUsuario tipoUsuario,
            AtualizarStatusConsultaRequest request
    ) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        validarAcessoConsulta(consulta, userId, tipoUsuario);

        StatusConsulta novoStatus = request.status();
        if (novoStatus == StatusConsulta.CANCELADA) {
            return cancelarComoUsuario(
                    consultaId,
                    userId,
                    tipoUsuario,
                    new CancelarConsultaRequest(StringUtils.sanitizeOptional(request.motivo()))
            );
        }

        if (novoStatus == StatusConsulta.AGENDADA) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Não é permitido reverter consulta para AGENDADA");
        }

        if (consulta.getStatus() == StatusConsulta.CANCELADA || consulta.getStatus() == StatusConsulta.CONCLUIDA) {
            throw new ApiException(HttpStatus.CONFLICT, "Consulta finalizada não permite mudança de status");
        }

        if (novoStatus == StatusConsulta.CONFIRMADA && tipoUsuario != TipoUsuario.PSICOLOGO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas psicólogos podem confirmar consultas");
        }

        if (novoStatus == StatusConsulta.FALTOU && tipoUsuario != TipoUsuario.PSICOLOGO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas psicólogos podem marcar falta");
        }

        if (novoStatus == StatusConsulta.EM_ANDAMENTO) {
            consulta.setIniciadoEm(LocalDateTime.now());
        }

        if (novoStatus == StatusConsulta.CONCLUIDA) {
            if (consulta.getIniciadoEm() == null) {
                consulta.setIniciadoEm(LocalDateTime.now());
            }
            consulta.setFinalizadoEm(LocalDateTime.now());
        }

        consulta.setStatus(novoStatus);
        return mapper.toResponse(consulta);
    }

    @Transactional
    public ConsultaResponse atualizarComoPsicologo(
            Long consultaId,
            Long psicologoId,
            AtualizarConsultaRequest request
    ) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        if (!consulta.getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Consulta não encontrada");
        }

        if (consulta.getStatus() == StatusConsulta.CANCELADA || consulta.getStatus() == StatusConsulta.CONCLUIDA) {
            throw new ApiException(HttpStatus.CONFLICT, "Consultas finalizadas não podem ser editadas");
        }

        LocalDateTime novoInicio = Objects.requireNonNull(request.inicioEm());
        validarHorarioNoPassado(novoInicio);

        IntervaloConsulta intervalo = resolverIntervaloDisponivel(psicologoId, novoInicio, request.fimEm());

        List<Consulta> conflitos = consultaRepository.findBlockingConsultasForUpdateExcludingId(
                consulta.getId(),
                psicologoId,
                intervalo.inicioEm(),
                intervalo.fimEm(),
                NON_CONFLICTING_STATUSES
        );
        if (!conflitos.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "Horário indisponível para remarcação");
        }

        consulta.setInicioEm(intervalo.inicioEm());
        consulta.setFimEm(intervalo.fimEm());
        consulta.setTipoAtendimento(request.tipoAtendimento() == null ? consulta.getTipoAtendimento() : request.tipoAtendimento());
        consulta.setObservacoes(StringUtils.sanitizeOptional(request.observacoes()));

        return mapper.toResponse(consulta);
    }

    @Transactional
    public ConsultaResponse excluirComoPsicologo(Long consultaId, Long psicologoId) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);
        if (!consulta.getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Consulta não encontrada");
        }
        if (consulta.getStatus() == StatusConsulta.CONCLUIDA) {
            throw new ApiException(HttpStatus.CONFLICT, "Consultas concluídas não podem ser excluídas");
        }
        consulta.setAtivo(false);
        consulta.setStatus(StatusConsulta.CANCELADA);
        if (consulta.getMotivoCancelamento() == null) {
            consulta.setMotivoCancelamento("Consulta removida pelo psicólogo");
        }
        return mapper.toResponse(consulta);
    }

    @Transactional
    public List<ConsultaResponse> agendarRecorrenciaComoPsicologo(
            @NonNull Long psicologoId,
            AgendarRecorrenciaRequest request
    ) {
        List<ConsultaResponse> criadas = new ArrayList<>();
        for (int i = 0; i < request.ocorrencias(); i += 1) {
            LocalDateTime inicio = aplicarFrequencia(request.inicioEm(), request.frequencia(), i);
            ConsultaResponse resposta = agendarComoPsicologo(
                    psicologoId,
                    new AgendarPorPsicologoRequest(
                            request.pacienteId(),
                            inicio,
                            null,
                            request.tipoAtendimento(),
                            request.observacoes()
                    )
            );
            criadas.add(resposta);
        }
        return criadas;
    }

    @Transactional(readOnly = true)
    public Consulta buscarConsultaDetalhada(Long consultaId) {
        return consultaRepository.findDetailedById(consultaId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Consulta não encontrada"));
    }

    private void validarPsicologoAtivo(Psicologo psicologo) {
        if (psicologo.getStatusAcesso() == StatusAcesso.PENDENTE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cadastro do psicólogo aguarda aprovação pelo administrador");
        }
        if (psicologo.getStatusAcesso() == StatusAcesso.REVOGADO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso do psicólogo foi revogado pelo administrador");
        }
    }

    private void validarHorarioNoPassado(LocalDateTime inicioEm) {
        if (inicioEm.isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Não é permitido agendar consulta em horário passado");
        }
    }

    private IntervaloConsulta resolverIntervaloDisponivel(Long psicologoId, LocalDateTime inicioEm, LocalDateTime fimEmInformado) {
        List<HorarioDisponivelDTO> disponibilidade = agendaService.listarDisponibilidade(
                psicologoId,
                inicioEm.toLocalDate(),
                inicioEm.toLocalDate()
        );

        HorarioDisponivelDTO horario = disponibilidade.stream()
                .filter(item -> item.inicio().equals(inicioEm))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "Horário indisponível para agendamento"));

        LocalDateTime fimEmCalculado = horario.fim();
        if (fimEmInformado != null && !fimEmInformado.equals(fimEmCalculado)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Horário de fim inválido para o início informado");
        }

        return new IntervaloConsulta(inicioEm, fimEmCalculado);
    }

    private void validarSemConflitoComLock(Long psicologoId, LocalDateTime inicioEm, LocalDateTime fimEm) {
        List<Consulta> conflitos = consultaRepository.findBlockingConsultasForUpdate(
                psicologoId,
                inicioEm,
                fimEm,
                NON_CONFLICTING_STATUSES
        );

        if (!conflitos.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "Horário indisponível para agendamento");
        }
    }

    @Transactional(readOnly = true)
    public Optional<Consulta> buscarConsultaAnteriorConcluida(Long pacienteId, Long psicologoId, LocalDateTime antesDe) {
        return consultaRepository
            .findFirstByPacienteIdAndPsicologoIdAndInicioEmBeforeAndStatusOrderByInicioEmDesc(
                        pacienteId, psicologoId, antesDe, StatusConsulta.CONCLUIDA);
    }

    private void validarAcessoConsulta(Consulta consulta, Long userId, TipoUsuario tipoUsuario) {
        boolean pertenceAoPaciente = tipoUsuario == TipoUsuario.PACIENTE && consulta.getPaciente().getId().equals(userId);
        boolean pertenceAoPsicologo = tipoUsuario == TipoUsuario.PSICOLOGO && consulta.getPsicologo().getId().equals(userId);

        if (!pertenceAoPaciente && !pertenceAoPsicologo) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Consulta não encontrada");
        }
    }

    @Transactional(readOnly = true)
    public List<Consulta> buscarConsultasPorPsicologoEPeriodo(
            Long psicologoId,
            Collection<StatusConsulta> statuses,
            LocalDateTime inicio,
            LocalDateTime fim
    ) {
        return consultaRepository.findByFiltros(null, psicologoId, statuses, inicio, fim);
    }

    @Transactional(readOnly = true)
    public boolean existeConflitoDeHorario(
            Long psicologoId,
            LocalDateTime inicio,
            LocalDateTime fim,
            Collection<StatusConsulta> statusesIgnorados
    ) {
        return consultaRepository.existsBlockingOverlap(psicologoId, inicio, fim, statusesIgnorados);
    }

    private LocalDateTime aplicarFrequencia(LocalDateTime inicio, FrequenciaRecorrencia frequencia, int indice) {
        if (indice == 0) return inicio;
        return switch (frequencia) {
            case SEMANAL -> inicio.plusWeeks(indice);
            case QUINZENAL -> inicio.plusWeeks(indice * 2L);
            case MENSAL -> inicio.plusMonths(indice);
        };
    }

    private record IntervaloConsulta(LocalDateTime inicioEm, LocalDateTime fimEm) {
    }
}
