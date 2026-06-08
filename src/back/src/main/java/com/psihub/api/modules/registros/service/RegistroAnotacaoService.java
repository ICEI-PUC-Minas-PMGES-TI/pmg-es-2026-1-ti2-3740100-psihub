package com.psihub.api.modules.registros.service;

import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.modules.registros.dto.RegistroAnotacaoRequest;
import com.psihub.api.modules.registros.dto.RegistroAnotacaoResponse;
import com.psihub.api.modules.registros.entity.RegistroAnotacao;
import com.psihub.api.modules.registros.entity.RegistroEmocional;
import com.psihub.api.modules.registros.repository.RegistroAnotacaoRepository;
import com.psihub.api.modules.registros.repository.RegistroEmocionalRepository;
import com.psihub.api.modules.vinculos.service.VinculoService;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.utils.StringUtils;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistroAnotacaoService {

    private final RegistroAnotacaoRepository registroAnotacaoRepository;
    private final RegistroEmocionalRepository registroEmocionalRepository;
    private final PsicologoService psicologoService;
    private final VinculoService vinculoService;

    public RegistroAnotacaoService(
            RegistroAnotacaoRepository registroAnotacaoRepository,
            RegistroEmocionalRepository registroEmocionalRepository,
            PsicologoService psicologoService,
            VinculoService vinculoService
    ) {
        this.registroAnotacaoRepository = registroAnotacaoRepository;
        this.registroEmocionalRepository = registroEmocionalRepository;
        this.psicologoService = psicologoService;
        this.vinculoService = vinculoService;
    }

    @Transactional(readOnly = true)
    public List<RegistroAnotacaoResponse> listarPorRegistro(Long psicologoId, Long pacienteId, Long registroId) {
        vinculoService.exigirVinculoAceito(pacienteId, psicologoId);

        RegistroEmocional registro = registroEmocionalRepository.findById(Objects.requireNonNull(registroId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Registro emocional não encontrado"));

        if (!registro.getPaciente().getId().equals(pacienteId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Registro emocional não encontrado");
        }

        return registroAnotacaoRepository.findByRegistroIdAndAtivoTrueOrderByCriadoEmAsc(registroId)
                .stream()
                .map(a -> new RegistroAnotacaoResponse(a.getId(), a.getPsicologo().getId(), a.getTexto(), a.getCriadoEm()))
                .collect(Collectors.toList());
    }

    @Transactional
    public RegistroAnotacaoResponse criar(Long psicologoId, Long pacienteId, Long registroId, RegistroAnotacaoRequest request) {
        vinculoService.exigirVinculoAceito(pacienteId, psicologoId);

        RegistroEmocional registro = registroEmocionalRepository.findById(Objects.requireNonNull(registroId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Registro emocional não encontrado"));

        if (!registro.getPaciente().getId().equals(pacienteId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Registro emocional não encontrado");
        }

        var psicologo = psicologoService.buscarPorId(psicologoId);

        RegistroAnotacao anotacao = new RegistroAnotacao();
        anotacao.setRegistro(registro);
        anotacao.setPsicologo(psicologo);
        anotacao.setTexto(StringUtils.sanitizeOptional(request.texto()));

        RegistroAnotacao salvo = registroAnotacaoRepository.save(anotacao);
        return new RegistroAnotacaoResponse(salvo.getId(), psicologo.getId(), salvo.getTexto(), salvo.getCriadoEm());
    }

    @Transactional
    public void deletar(Long psicologoId, Long pacienteId, Long registroId, Long anotacaoId) {
        vinculoService.exigirVinculoAceito(pacienteId, psicologoId);

        RegistroAnotacao anotacao = registroAnotacaoRepository.findById(Objects.requireNonNull(anotacaoId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Anotação não encontrada"));

        if (!anotacao.getRegistro().getId().equals(registroId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Anotação não encontrada");
        }

        if (!anotacao.getRegistro().getPaciente().getId().equals(pacienteId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Anotação não encontrada");
        }

        if (!anotacao.getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Somente autor pode remover anotação");
        }

        anotacao.setAtivo(false);
        registroAnotacaoRepository.save(anotacao);
    }

}

