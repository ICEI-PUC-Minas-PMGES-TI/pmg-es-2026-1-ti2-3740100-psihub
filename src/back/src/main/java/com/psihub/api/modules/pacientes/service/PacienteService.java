package com.psihub.api.modules.pacientes.service;

import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.repository.PacienteRepository;
import com.psihub.api.shared.exception.ApiException;
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
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Paciente nao encontrado"));
    }

    @Transactional
    public void criarPerfilInicial(Usuario usuario) {
        Paciente paciente = new Paciente();
        paciente.setUsuario(usuario);
        paciente.setDataNascimento(LocalDate.of(1900, 1, 1));
        pacienteRepository.save(paciente);
    }

    @Transactional(readOnly = true)
    public List<Paciente> buscarPorPsicologoId(Long psicologoId, String nome) {
        return pacienteRepository.findByPsicologoId(psicologoId, nome);
    }
}
