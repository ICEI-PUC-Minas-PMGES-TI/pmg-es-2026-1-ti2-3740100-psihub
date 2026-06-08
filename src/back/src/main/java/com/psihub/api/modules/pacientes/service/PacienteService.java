package com.psihub.api.modules.pacientes.service;

import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.pacientes.dto.PacientePerfilRequest;
import com.psihub.api.modules.pacientes.dto.PacientePerfilResponse;
import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.repository.PacienteRepository;
import com.psihub.api.modules.vinculos.entity.StatusVinculo;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.utils.StringUtils;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    @Transactional(readOnly = true)
    public Paciente buscarPorId(Long id) {
        return pacienteRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Paciente não encontrado"));
    }

    @Transactional
    public void criarPerfilInicial(Usuario usuario, LocalDate dataNascimento) {
        Paciente paciente = new Paciente();
        paciente.setUsuario(usuario);
        paciente.setDataNascimento(dataNascimento);
        pacienteRepository.save(paciente);
    }

    @Transactional(readOnly = true)
    public PacientePerfilResponse obterPerfil(Long pacienteId) {
        return toPerfilResponse(buscarPorId(pacienteId));
    }

    @Transactional
    public PacientePerfilResponse atualizarPerfil(Long pacienteId, PacientePerfilRequest request) {
        Paciente paciente = buscarPorId(pacienteId);
        Usuario usuario = paciente.getUsuario();

        String nome = StringUtils.sanitizeOptional(request.nome());
        if (nome != null) {
            usuario.setNome(nome);
        }
        usuario.setTelefone(StringUtils.sanitizeOptional(request.telefone()));
        usuario.setFotoUrl(StringUtils.sanitizeOptional(request.fotoPerfilUrl()));
        if (request.dataNascimento() != null) {
            paciente.setDataNascimento(request.dataNascimento());
        }
        paciente.setObservacoesIniciais(StringUtils.sanitizeOptional(request.observacoesIniciais()));

        return toPerfilResponse(paciente);
    }

    @Transactional(readOnly = true)
    public List<Paciente> buscarPorPsicologoId(Long psicologoId, String nome) {
        return pacienteRepository.findByPsicologoId(psicologoId, StatusVinculo.ACEITO, nome);
    }

    private PacientePerfilResponse toPerfilResponse(Paciente paciente) {
        return new PacientePerfilResponse(
                paciente.getId(),
                paciente.getUsuario().getNome(),
                paciente.getUsuario().getEmail(),
                paciente.getUsuario().getTelefone(),
                paciente.getUsuario().getFotoUrl(),
                paciente.getDataNascimento(),
                paciente.getObservacoesIniciais()
        );
    }

}
