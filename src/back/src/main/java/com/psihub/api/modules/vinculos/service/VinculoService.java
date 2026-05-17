package com.psihub.api.modules.vinculos.service;

import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.modules.vinculos.dto.VinculoResponse;
import com.psihub.api.modules.vinculos.entity.StatusVinculo;
import com.psihub.api.modules.vinculos.entity.VinculoPsicologoPaciente;
import com.psihub.api.modules.vinculos.repository.VinculoPsicologoPacienteRepository;
import com.psihub.api.shared.exception.ApiException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VinculoService {

    private final VinculoPsicologoPacienteRepository vinculoRepository;
    private final PacienteService pacienteService;
    private final PsicologoService psicologoService;

    public VinculoService(
            VinculoPsicologoPacienteRepository vinculoRepository,
            PacienteService pacienteService,
            PsicologoService psicologoService
    ) {
        this.vinculoRepository = vinculoRepository;
        this.pacienteService = pacienteService;
        this.psicologoService = psicologoService;
    }

    @Transactional
    public VinculoResponse solicitarComoPaciente(Long pacienteId, Long psicologoId) {
        Paciente paciente = pacienteService.buscarPorId(pacienteId);
        Psicologo psicologo = psicologoService.buscarAtivoPorId(psicologoId);
        VinculoPsicologoPaciente vinculo = vinculoRepository
                .findByPacienteIdAndPsicologoId(pacienteId, psicologoId)
                .orElseGet(() -> novoVinculo(paciente, psicologo));

        if (vinculo.getStatus() == StatusVinculo.ACEITO) {
            return toResponse(vinculo);
        }
        if (vinculo.getStatus() == StatusVinculo.ENCERRADO) {
            throw new ApiException(HttpStatus.CONFLICT, "Vinculo encerrado nao pode ser reaberto automaticamente");
        }

        vinculo.setStatus(StatusVinculo.SOLICITADO);
        vinculo.setRespondidoEm(null);
        return toResponse(vinculoRepository.save(vinculo));
    }

    @Transactional
    public VinculoResponse garantirSolicitado(Long pacienteId, Long psicologoId) {
        Paciente paciente = pacienteService.buscarPorId(pacienteId);
        Psicologo psicologo = psicologoService.buscarAtivoPorId(psicologoId);
        VinculoPsicologoPaciente vinculo = vinculoRepository
                .findByPacienteIdAndPsicologoId(pacienteId, psicologoId)
                .orElseGet(() -> novoVinculo(paciente, psicologo));

        if (vinculo.getStatus() == StatusVinculo.ENCERRADO) {
            throw new ApiException(HttpStatus.CONFLICT, "Vinculo encerrado nao permite novo agendamento");
        }
        if (vinculo.getStatus() == StatusVinculo.RECUSADO) {
            vinculo.setStatus(StatusVinculo.SOLICITADO);
            vinculo.setRespondidoEm(null);
        }
        return toResponse(vinculoRepository.save(vinculo));
    }

    @Transactional
    public VinculoResponse garantirAceito(Long pacienteId, Long psicologoId) {
        Paciente paciente = pacienteService.buscarPorId(pacienteId);
        Psicologo psicologo = psicologoService.buscarAtivoPorId(psicologoId);
        VinculoPsicologoPaciente vinculo = vinculoRepository
                .findByPacienteIdAndPsicologoId(pacienteId, psicologoId)
                .orElseGet(() -> novoVinculo(paciente, psicologo));

        if (vinculo.getStatus() == StatusVinculo.ENCERRADO) {
            throw new ApiException(HttpStatus.CONFLICT, "Vinculo encerrado nao permite novo agendamento");
        }
        vinculo.setStatus(StatusVinculo.ACEITO);
        vinculo.setRespondidoEm(LocalDateTime.now());
        return toResponse(vinculoRepository.save(vinculo));
    }

    @Transactional(readOnly = true)
    public List<VinculoResponse> listarComoPsicologo(Long psicologoId, StatusVinculo status) {
        psicologoService.buscarPorId(psicologoId);
        return vinculoRepository.findByPsicologoAndStatus(psicologoId, status)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public VinculoResponse aceitarComoPsicologo(Long psicologoId, Long vinculoId) {
        VinculoPsicologoPaciente vinculo = buscarDoPsicologo(psicologoId, vinculoId);
        if (vinculo.getStatus() != StatusVinculo.SOLICITADO) {
            throw new ApiException(HttpStatus.CONFLICT, "Apenas vinculos solicitados podem ser aceitos");
        }

        vinculo.setStatus(StatusVinculo.ACEITO);
        vinculo.setRespondidoEm(LocalDateTime.now());
        return toResponse(vinculo);
    }

    @Transactional
    public VinculoResponse recusarComoPsicologo(Long psicologoId, Long vinculoId) {
        VinculoPsicologoPaciente vinculo = buscarDoPsicologo(psicologoId, vinculoId);
        if (vinculo.getStatus() != StatusVinculo.SOLICITADO) {
            throw new ApiException(HttpStatus.CONFLICT, "Apenas vinculos solicitados podem ser recusados");
        }

        vinculo.setStatus(StatusVinculo.RECUSADO);
        vinculo.setRespondidoEm(LocalDateTime.now());
        return toResponse(vinculo);
    }

    @Transactional(readOnly = true)
    public void exigirVinculoAceito(Long pacienteId, Long psicologoId) {
        if (!vinculoRepository.existsByPacienteIdAndPsicologoIdAndStatus(
                Objects.requireNonNull(pacienteId),
                Objects.requireNonNull(psicologoId),
                StatusVinculo.ACEITO
        )) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso clinico negado: paciente sem vinculo aceito com o psicologo");
        }
    }

    private VinculoPsicologoPaciente novoVinculo(Paciente paciente, Psicologo psicologo) {
        VinculoPsicologoPaciente vinculo = new VinculoPsicologoPaciente();
        vinculo.setPaciente(paciente);
        vinculo.setPsicologo(psicologo);
        vinculo.setStatus(StatusVinculo.SOLICITADO);
        return vinculo;
    }

    private VinculoPsicologoPaciente buscarDoPsicologo(Long psicologoId, Long vinculoId) {
        VinculoPsicologoPaciente vinculo = vinculoRepository.findById(Objects.requireNonNull(vinculoId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Vinculo nao encontrado"));
        if (!vinculo.getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Vinculo nao encontrado");
        }
        return vinculo;
    }

    private VinculoResponse toResponse(VinculoPsicologoPaciente vinculo) {
        return new VinculoResponse(
                vinculo.getId(),
                vinculo.getPaciente().getId(),
                vinculo.getPaciente().getUsuario().getNome(),
                vinculo.getPaciente().getUsuario().getEmail(),
                vinculo.getPsicologo().getId(),
                vinculo.getPsicologo().getUsuario().getNome(),
                vinculo.getStatus(),
                vinculo.getSolicitadoEm(),
                vinculo.getRespondidoEm()
        );
    }
}
