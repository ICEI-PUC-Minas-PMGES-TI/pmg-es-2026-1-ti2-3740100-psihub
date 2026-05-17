package com.psihub.api.modules.consultas.service;

import com.psihub.api.modules.agenda.entity.SlotConsulta;
import com.psihub.api.modules.agenda.service.SlotConsultaService;
import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.auth.service.AuthService;
import com.psihub.api.modules.consultas.dto.AgendarConsultaRequest;
import com.psihub.api.modules.consultas.dto.AgendarPorPsicologoRequest;
import com.psihub.api.modules.consultas.dto.CancelarConsultaRequest;
import com.psihub.api.modules.consultas.dto.ConsultaResponse;
import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.consultas.repository.ConsultaRepository;
import com.psihub.api.modules.notificacoes.service.NotificacaoService;
import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.shared.enums.StatusAcesso;
import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.enums.StatusSlotConsulta;
import com.psihub.api.shared.enums.TipoAtendimento;
import com.psihub.api.shared.enums.TipoUsuario;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.utils.ApiResponseMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private final AuthService authService;
    private final SlotConsultaService slotConsultaService;
    private final ApiResponseMapper mapper;
    private final NotificacaoService notificacaoService;

    public ConsultaService(
            ConsultaRepository consultaRepository,
            PacienteService pacienteService,
            PsicologoService psicologoService,
            AuthService authService,
            SlotConsultaService slotConsultaService,
            ApiResponseMapper mapper,
            NotificacaoService notificacaoService
    ) {
        this.consultaRepository = consultaRepository;
        this.pacienteService = pacienteService;
        this.psicologoService = psicologoService;
        this.authService = authService;
        this.slotConsultaService = slotConsultaService;
        this.mapper = mapper;
        this.notificacaoService = notificacaoService;
    }

    @Transactional
    public ConsultaResponse agendarComoPaciente(@NonNull Long pacienteId, AgendarConsultaRequest request) {
        Paciente paciente = pacienteService.buscarPorId(pacienteId);
        Psicologo psicologo = psicologoService.buscarPorId(Objects.requireNonNull(request.psicologoId()));
        Usuario agendadoPor = authService.buscarUsuarioPorId(pacienteId);
        SlotConsulta slot = slotConsultaService.buscarParaReserva(Objects.requireNonNull(request.slotConsultaId()));

        validarPsicologoAtivo(psicologo);
        validarSlotDisponivel(slot, psicologo.getId());

        Consulta consulta = new Consulta();
        consulta.setPaciente(paciente);
        consulta.setPsicologo(psicologo);
        consulta.setSlotConsulta(slot);
        consulta.setAgendadoPorUsuario(agendadoPor);
        consulta.setTipoAtendimento(request.tipoAtendimento() == null ? TipoAtendimento.ONLINE : request.tipoAtendimento());
        consulta.setStatus(StatusConsulta.AGENDADA);
        consulta.setObservacoes(sanitizeOptional(request.observacoes()));

        slot.setStatus(StatusSlotConsulta.RESERVADO);
        return mapper.toResponse(consultaRepository.save(consulta));
    }

    @Transactional
    public ConsultaResponse agendarComoPsicologo(@NonNull Long psicologoId, AgendarPorPsicologoRequest request) {
        Psicologo psicologo = psicologoService.buscarPorId(psicologoId);
        Paciente paciente = pacienteService.buscarPorId(Objects.requireNonNull(request.pacienteId()));
        Usuario agendadoPor = authService.buscarUsuarioPorId(psicologoId);
        SlotConsulta slot = slotConsultaService.buscarParaReserva(Objects.requireNonNull(request.slotConsultaId()));

        validarPsicologoAtivo(psicologo);
        validarSlotDisponivel(slot, psicologoId);

        Consulta consulta = new Consulta();
        consulta.setPaciente(paciente);
        consulta.setPsicologo(psicologo);
        consulta.setSlotConsulta(slot);
        consulta.setAgendadoPorUsuario(agendadoPor);
        consulta.setTipoAtendimento(request.tipoAtendimento() == null ? TipoAtendimento.ONLINE : request.tipoAtendimento());
        consulta.setStatus(StatusConsulta.AGENDADA);
        consulta.setObservacoes(sanitizeOptional(request.observacoes()));

        slot.setStatus(StatusSlotConsulta.RESERVADO);
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
            throw new ApiException(HttpStatus.NOT_FOUND, "Consulta nao encontrada");
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
            throw new ApiException(HttpStatus.CONFLICT, "Consultas concluidas nao podem ser canceladas");
        }

        if (consulta.getStatus() == StatusConsulta.CANCELADA) {
            return mapper.toResponse(consulta);
        }

        consulta.setAtivo(false);
        consulta.setStatus(StatusConsulta.CANCELADA);
        consulta.setMotivoCancelamento(request == null ? null : request.motivoCancelamento());
        consulta.getSlotConsulta().setStatus(StatusSlotConsulta.DISPONIVEL);

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
            throw new ApiException(HttpStatus.CONFLICT, "Consultas concluidas nao podem ser canceladas");
        }

        if (consulta.getStatus() == StatusConsulta.CANCELADA) {
            return mapper.toResponse(consulta);
        }

        consulta.setAtivo(false);
        consulta.setStatus(StatusConsulta.CANCELADA);
        consulta.setMotivoCancelamento(request == null ? null : sanitizeOptional(request.motivoCancelamento()));
        consulta.getSlotConsulta().setStatus(StatusSlotConsulta.DISPONIVEL);

        if (tipoUsuario == TipoUsuario.PACIENTE) {
            notificacaoService.notificarCancelamentoParaPsicologo(consulta);
        } else if (tipoUsuario == TipoUsuario.PSICOLOGO) {
            notificacaoService.notificarCancelamentoParaPaciente(consulta);
        }

        return mapper.toResponse(consulta);
    }

    @Transactional(readOnly = true)
    public Consulta buscarConsultaDetalhada(Long consultaId) {
        return consultaRepository.findDetailedById(consultaId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Consulta nao encontrada"));
    }

    private void validarPsicologoAtivo(Psicologo psicologo) {
        if (psicologo.getStatusAcesso() != StatusAcesso.ATIVO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Psicologo ainda nao possui acesso ativo");
        }
    }

    private void validarSlotDisponivel(SlotConsulta slot, Long psicologoId) {
        if (!slot.getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Horario nao pertence ao psicologo informado");
        }

        if (slot.getStatus() != StatusSlotConsulta.DISPONIVEL) {
            throw new ApiException(HttpStatus.CONFLICT, "Horario indisponivel para agendamento");
        }

        if (slot.getInicioEm().isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nao e permitido agendar consulta em horario passado");
        }

        if (consultaRepository.existsBlockingOverlap(psicologoId, slot.getInicioEm(), slot.getFimEm(), NON_CONFLICTING_STATUSES)) {
            throw new ApiException(HttpStatus.CONFLICT, "Horario indisponivel para agendamento");
        }

        slotConsultaService.validarSemConflitoComPausa(psicologoId, slot.getInicioEm().toLocalDate(), slot.getInicioEm().toLocalTime(), slot.getFimEm().toLocalTime());
    }

    @Transactional(readOnly = true)
    public Optional<Consulta> buscarConsultaAnteriorConcluida(Long pacienteId, Long psicologoId, LocalDateTime antesDe) {
        return consultaRepository
                .findFirstByPacienteIdAndPsicologoIdAndSlotConsultaInicioEmBeforeAndStatusOrderBySlotConsultaInicioEmDesc(
                        pacienteId, psicologoId, antesDe, StatusConsulta.CONCLUIDA);
    }

    private void validarAcessoConsulta(Consulta consulta, Long userId, TipoUsuario tipoUsuario) {
        boolean pertenceAoPaciente = tipoUsuario == TipoUsuario.PACIENTE && consulta.getPaciente().getId().equals(userId);
        boolean pertenceAoPsicologo = tipoUsuario == TipoUsuario.PSICOLOGO && consulta.getPsicologo().getId().equals(userId);

        if (!pertenceAoPaciente && !pertenceAoPsicologo) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Consulta nao encontrada");
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

    private String sanitizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        return normalized.isBlank() ? null : normalized;
    }
}

