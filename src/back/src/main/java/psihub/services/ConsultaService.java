package psihub.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import psihub.domain.enums.StatusAcesso;
import psihub.domain.enums.StatusConsulta;
import psihub.domain.enums.StatusSlotConsulta;
import psihub.domain.enums.TipoAtendimento;
import psihub.domain.model.Consulta;
import psihub.domain.model.Paciente;
import psihub.domain.model.Psicologo;
import psihub.domain.model.SlotConsulta;
import psihub.domain.model.Usuario;
import psihub.dtos.consultas.AgendarConsultaRequest;
import psihub.dtos.consultas.CancelarConsultaRequest;
import psihub.dtos.consultas.ConsultaResponse;
import psihub.exceptions.ApiException;
import psihub.mappers.ApiResponseMapper;
import psihub.repositories.ConsultaRepository;
import psihub.repositories.PacienteRepository;
import psihub.repositories.PsicologoRepository;
import psihub.repositories.SlotConsultaRepository;
import psihub.repositories.UsuarioRepository;

@Service
public class ConsultaService {

    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final PsicologoRepository psicologoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SlotConsultaRepository slotConsultaRepository;
    private final ApiResponseMapper mapper;

    public ConsultaService(
            ConsultaRepository consultaRepository,
            PacienteRepository pacienteRepository,
            PsicologoRepository psicologoRepository,
            UsuarioRepository usuarioRepository,
            SlotConsultaRepository slotConsultaRepository,
            ApiResponseMapper mapper
    ) {
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
        this.psicologoRepository = psicologoRepository;
        this.usuarioRepository = usuarioRepository;
        this.slotConsultaRepository = slotConsultaRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ConsultaResponse agendar(AgendarConsultaRequest request) {
        Paciente paciente = pacienteRepository.findById(request.pacienteId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Paciente nao encontrado"));
        Psicologo psicologo = psicologoRepository.findById(request.psicologoId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Psicologo nao encontrado"));
        Usuario agendadoPor = usuarioRepository.findById(request.agendadoPorUsuarioId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario responsavel pelo agendamento nao encontrado"));
        SlotConsulta slot = slotConsultaRepository.findByIdForUpdate(request.slotConsultaId())
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
        consulta.setObservacoes(request.observacoes());

        slot.setStatus(StatusSlotConsulta.RESERVADO);
        Consulta consultaSalva = consultaRepository.save(consulta);
        return mapper.toResponse(consultaSalva);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listar(
            Long pacienteId,
            Long psicologoId,
            StatusConsulta status,
            LocalDate inicio,
            LocalDate fim
    ) {
        LocalDate dataInicio = inicio == null ? LocalDate.now().minusDays(30) : inicio;
        LocalDate dataFim = fim == null ? dataInicio.plusDays(60) : fim;

        if (dataFim.isBefore(dataInicio)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Data final deve ser posterior ou igual a inicial");
        }

        return consultaRepository.findByFiltros(
                        pacienteId,
                        psicologoId,
                        status,
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
    public ConsultaResponse cancelar(Long consultaId, CancelarConsultaRequest request) {
        Consulta consulta = buscarConsultaDetalhada(consultaId);

        if (consulta.getStatus() == StatusConsulta.CONCLUIDA) {
            throw new ApiException(HttpStatus.CONFLICT, "Consultas concluidas nao podem ser canceladas");
        }

        if (consulta.getStatus() == StatusConsulta.CANCELADA) {
            return mapper.toResponse(consulta);
        }

        consulta.setStatus(StatusConsulta.CANCELADA);
        consulta.setMotivoCancelamento(request == null ? null : request.motivoCancelamento());
        consulta.getSlotConsulta().setStatus(StatusSlotConsulta.DISPONIVEL);

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
    }
}
