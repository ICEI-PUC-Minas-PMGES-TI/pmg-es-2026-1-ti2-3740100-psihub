package com.psihub.api.modules.registros.service;

import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.registros.dto.RegistroEmocionalRequest;
import com.psihub.api.modules.registros.entity.RegistroEmocional;
import com.psihub.api.modules.registros.repository.RegistroEmocionalRepository;
import com.psihub.api.modules.sessoes.dto.RegistroEmocionalResponse;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.utils.ApiResponseMapper;
import com.psihub.api.shared.utils.JsonListMapper;
import com.psihub.api.shared.utils.StringUtils;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistroEmocionalService {

    private final RegistroEmocionalRepository registroEmocionalRepository;
    private final PacienteService pacienteService;
    private final JsonListMapper jsonListMapper;
    private final ApiResponseMapper mapper;

    public RegistroEmocionalService(
            RegistroEmocionalRepository registroEmocionalRepository,
            PacienteService pacienteService,
            JsonListMapper jsonListMapper,
            ApiResponseMapper mapper
    ) {
        this.registroEmocionalRepository = registroEmocionalRepository;
        this.pacienteService = pacienteService;
        this.jsonListMapper = jsonListMapper;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<RegistroEmocional> buscarPorPacienteEPeriodo(Long pacienteId, LocalDateTime inicio, LocalDateTime fim) {
        return registroEmocionalRepository
                .findByPacienteIdAndRegistradoEmBetweenOrderByRegistradoEmAsc(pacienteId, inicio, fim);
    }

    @Transactional(readOnly = true)
    public List<RegistroEmocionalResponse> listarComoPaciente(Long pacienteId) {
        return registroEmocionalRepository.findByPacienteIdOrderByRegistradoEmDesc(Objects.requireNonNull(pacienteId))
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public RegistroEmocionalResponse criarComoPaciente(Long pacienteId, RegistroEmocionalRequest request) {
        Paciente paciente = pacienteService.buscarPorId(pacienteId);
        validarPayload(request);

        RegistroEmocional registro = new RegistroEmocional();
        registro.setPaciente(paciente);
        aplicarPayload(registro, request);

        return mapper.toResponse(registroEmocionalRepository.save(registro));
    }

    @Transactional
    public RegistroEmocionalResponse atualizarComoPaciente(Long pacienteId, Long registroId, RegistroEmocionalRequest request) {
        RegistroEmocional registro = registroEmocionalRepository.findById(Objects.requireNonNull(registroId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Registro emocional não encontrado"));

        if (!registro.getPaciente().getId().equals(pacienteId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Registro emocional não encontrado");
        }
        if (LocalDateTime.now().isAfter(registro.getEditavelAte())) {
            throw new ApiException(HttpStatus.CONFLICT, "Registro emocional não pode ser editado apos 24h");
        }

        validarPayload(request);
        aplicarPayload(registro, request);
        return mapper.toResponse(registro);
    }

    @Transactional(readOnly = true)
    public RegistroEmocional buscarPorId(Long registroId) {
        return registroEmocionalRepository.findById(Objects.requireNonNull(registroId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Registro emocional não encontrado"));
    }

    private void validarPayload(RegistroEmocionalRequest request) {
        if (request == null || request.humorDia() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Humor do dia é obrigatório");
        }
        if (request.humorDia() < 1 || request.humorDia() > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Humor do dia deve estar entre 1 e 5");
        }
    }

    private void aplicarPayload(RegistroEmocional registro, RegistroEmocionalRequest request) {
        registro.setHumorDia(request.humorDia());
        registro.setDescricao(StringUtils.sanitizeOptional(request.descricao()));
        registro.setEmocoes(jsonListMapper.toJson(normalizeList(request.emocoes())));
    }

    private List<String> normalizeList(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .map(StringUtils::sanitizeOptional)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

}
