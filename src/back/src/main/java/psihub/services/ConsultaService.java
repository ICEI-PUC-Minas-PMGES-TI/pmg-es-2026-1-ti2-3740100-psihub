package psihub.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import psihub.domain.enums.DiaSemana;
import psihub.domain.enums.StatusAcesso;
import psihub.domain.enums.StatusConsulta;
import psihub.domain.enums.StatusSlotConsulta;
import psihub.domain.enums.TipoAtendimento;
import psihub.domain.enums.TipoUsuario;
import psihub.domain.model.Consulta;
import psihub.domain.model.Paciente;
import psihub.domain.model.Psicologo;
import psihub.domain.model.RegraDisponibilidade;
import psihub.domain.model.SlotConsulta;
import psihub.domain.model.Usuario;
import psihub.dtos.consultas.AgendarConsultaRequest;
import psihub.dtos.consultas.AgendarPorPsicologoRequest;
import psihub.dtos.consultas.CancelarConsultaRequest;
import psihub.dtos.consultas.ConsultaResponse;
import psihub.exceptions.ApiException;
import psihub.mappers.ApiResponseMapper;
import psihub.repositories.ConsultaRepository;
import psihub.repositories.PacienteRepository;
import psihub.repositories.PsicologoRepository;
import psihub.repositories.RegraDisponibilidadeRepository;
import psihub.repositories.SlotConsultaRepository;
import psihub.repositories.UsuarioRepository;
import org.springframework.lang.NonNull;

@Service
public class ConsultaService {

    private static final Collection<StatusConsulta> ACTIVE_STATUSES = List.of(
            StatusConsulta.AGENDADA, StatusConsulta.CONFIRMADA, StatusConsulta.EM_ANDAMENTO);

    private static final Collection<StatusConsulta> NON_CONFLICTING_STATUSES = List.of(
            StatusConsulta.CANCELADA, StatusConsulta.CONCLUIDA, StatusConsulta.FALTOU);

    private static final Collection<StatusConsulta> ALL_STATUSES =
            Arrays.asList(StatusConsulta.values());

    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final PsicologoRepository psicologoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SlotConsultaRepository slotConsultaRepository;
    private final RegraDisponibilidadeRepository regraDisponibilidadeRepository;
    private final ApiResponseMapper mapper;
    private final NotificacaoService notificacaoService;

    public ConsultaService(
            ConsultaRepository consultaRepository,
            PacienteRepository pacienteRepository,
            PsicologoRepository psicologoRepository,
            UsuarioRepository usuarioRepository,
            SlotConsultaRepository slotConsultaRepository,
            RegraDisponibilidadeRepository regraDisponibilidadeRepository,
            ApiResponseMapper mapper,
            NotificacaoService notificacaoService
    ) {
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
        this.psicologoRepository = psicologoRepository;
        this.usuarioRepository = usuarioRepository;
        this.slotConsultaRepository = slotConsultaRepository;
        this.regraDisponibilidadeRepository = regraDisponibilidadeRepository;
        this.mapper = mapper;
        this.notificacaoService = notificacaoService;
    }

    @Transactional
    public ConsultaResponse agendarComoPaciente(@NonNull Long pacienteId, AgendarConsultaRequest request) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Paciente nao encontrado"));
        Psicologo psicologo = psicologoRepository.findById(Objects.requireNonNull(request.psicologoId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Psicologo nao encontrado"));
        Usuario agendadoPor = usuarioRepository.findById(pacienteId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario responsavel pelo agendamento nao encontrado"));
        SlotConsulta slot = slotConsultaRepository.findByIdForUpdate(Objects.requireNonNull(request.slotConsultaId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Horario nao encontrado"));

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
        Psicologo psicologo = psicologoRepository.findById(psicologoId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Psicologo nao encontrado"));
        Paciente paciente = pacienteRepository.findById(Objects.requireNonNull(request.pacienteId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Paciente nao encontrado"));
        Usuario agendadoPor = usuarioRepository.findById(psicologoId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario responsavel pelo agendamento nao encontrado"));
        SlotConsulta slot = slotConsultaRepository.findByIdForUpdate(Objects.requireNonNull(request.slotConsultaId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Horario nao encontrado"));

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

        validarSemConflitoComPausa(psicologoId, slot.getInicioEm().toLocalDate(), slot.getInicioEm().toLocalTime(), slot.getFimEm().toLocalTime());
    }

    private void validarSemConflitoComPausa(Long psicologoId, LocalDate data, LocalTime inicio, LocalTime fim) {
        regraDisponibilidadeRepository.findByPsicologoIdAndDiaSemanaAndAtivoTrueOrderByIdDesc(psicologoId, toDiaSemana(data))
                .stream()
                .filter(regra -> regraVigenteNaData(regra, data))
                .findFirst()
                .ifPresent(regra -> {
                    if (sobrepoePausa(inicio, fim, regra)) {
                        throw new ApiException(HttpStatus.CONFLICT, "Horario reservado para intervalo");
                    }
                });
    }

    private boolean regraVigenteNaData(RegraDisponibilidade regra, LocalDate data) {
        return !regra.getValidoAPartirDe().isAfter(data)
                && (regra.getValidoAte() == null || !regra.getValidoAte().isBefore(data));
    }

    private boolean sobrepoePausa(LocalTime inicio, LocalTime fim, RegraDisponibilidade regra) {
        if (regra.getPausaInicio() == null || regra.getPausaFim() == null) {
            return false;
        }

        return inicio.isBefore(regra.getPausaFim()) && fim.isAfter(regra.getPausaInicio());
    }

    private DiaSemana toDiaSemana(LocalDate data) {
        return switch (data.getDayOfWeek()) {
            case MONDAY -> DiaSemana.SEGUNDA;
            case TUESDAY -> DiaSemana.TERCA;
            case WEDNESDAY -> DiaSemana.QUARTA;
            case THURSDAY -> DiaSemana.QUINTA;
            case FRIDAY -> DiaSemana.SEXTA;
            case SATURDAY -> DiaSemana.SABADO;
            case SUNDAY -> DiaSemana.DOMINGO;
        };
    }

    private void validarAcessoConsulta(Consulta consulta, Long userId, TipoUsuario tipoUsuario) {
        boolean pertenceAoPaciente = tipoUsuario == TipoUsuario.PACIENTE && consulta.getPaciente().getId().equals(userId);
        boolean pertenceAoPsicologo = tipoUsuario == TipoUsuario.PSICOLOGO && consulta.getPsicologo().getId().equals(userId);

        if (!pertenceAoPaciente && !pertenceAoPsicologo) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Consulta nao encontrada");
        }
    }

    private String sanitizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        return normalized.isBlank() ? null : normalized;
    }
}
