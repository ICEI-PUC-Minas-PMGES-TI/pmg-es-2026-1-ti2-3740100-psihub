package com.psihub.api.modules.avaliacoes.service;

import com.psihub.api.modules.avaliacoes.dto.AvaliacaoResponse;
import com.psihub.api.modules.avaliacoes.dto.MediaAvaliacaoResponse;
import com.psihub.api.modules.avaliacoes.dto.RegistrarAvaliacaoRequest;
import com.psihub.api.modules.avaliacoes.entity.Avaliacao;
import com.psihub.api.modules.avaliacoes.repository.AvaliacaoRepository;
import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.consultas.repository.ConsultaRepository;
import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.repository.PacienteRepository;
import com.psihub.api.shared.exception.ApiException;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;

    public AvaliacaoService(
            AvaliacaoRepository avaliacaoRepository,
            ConsultaRepository consultaRepository,
            PacienteRepository pacienteRepository
    ) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
    }

    @Transactional
    public AvaliacaoResponse registrar(Long pacienteId, Long consultaId, RegistrarAvaliacaoRequest request) {
        Consulta consulta = consultaRepository.findById(Objects.requireNonNull(consultaId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Consulta não encontrada"));

        if (!consulta.getPaciente().getId().equals(pacienteId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Esta consulta não pertence ao paciente autenticado");
        }

        if (avaliacaoRepository.existsByConsultaId(consultaId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Esta consulta já possui uma avaliação");
        }

        Paciente paciente = pacienteRepository.findById(Objects.requireNonNull(pacienteId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Paciente não encontrado"));

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setConsulta(consulta);
        avaliacao.setPaciente(paciente);
        avaliacao.setPsicologo(consulta.getPsicologo());
        avaliacao.setNota(request.nota());
        avaliacao.setComentario(request.comentario());

        avaliacao = avaliacaoRepository.save(avaliacao);
        return toResponse(avaliacao);
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listarPorPsicologo(Long psicologoId) {
        return avaliacaoRepository.findByPsicologoId(psicologoId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MediaAvaliacaoResponse mediaDosPsicologo(Long psicologoId) {
        Double media = avaliacaoRepository.findMediaByPsicologoId(psicologoId);
        long total = avaliacaoRepository.countByPsicologoId(psicologoId);
        return new MediaAvaliacaoResponse(media != null ? media : 0.0, (int) total);
    }

    private AvaliacaoResponse toResponse(Avaliacao avaliacao) {
        return new AvaliacaoResponse(
                avaliacao.getId(),
                avaliacao.getConsulta().getId(),
                avaliacao.getPaciente().getUsuario().getNome(),
                avaliacao.getNota(),
                avaliacao.getComentario(),
                avaliacao.getCriadoEm()
        );
    }
}
