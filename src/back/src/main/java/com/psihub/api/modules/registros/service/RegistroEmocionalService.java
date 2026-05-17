package com.psihub.api.modules.registros.service;

import com.psihub.api.modules.registros.entity.RegistroEmocional;
import com.psihub.api.modules.registros.repository.RegistroEmocionalRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistroEmocionalService {

    private final RegistroEmocionalRepository registroEmocionalRepository;

    public RegistroEmocionalService(RegistroEmocionalRepository registroEmocionalRepository) {
        this.registroEmocionalRepository = registroEmocionalRepository;
    }

    @Transactional(readOnly = true)
    public List<RegistroEmocional> buscarPorPacienteEPeriodo(Long pacienteId, LocalDateTime inicio, LocalDateTime fim) {
        return registroEmocionalRepository
                .findByPacienteIdAndRegistradoEmBetweenOrderByRegistradoEmAsc(pacienteId, inicio, fim);
    }
}
