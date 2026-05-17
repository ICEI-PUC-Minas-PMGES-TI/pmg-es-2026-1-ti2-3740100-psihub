package com.psihub.api.modules.registros.repository;

import com.psihub.api.modules.registros.entity.RegistroEmocional;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistroEmocionalRepository extends JpaRepository<RegistroEmocional, Long> {

    List<RegistroEmocional> findByPacienteIdAndRegistradoEmBetweenOrderByRegistradoEmAsc(
            Long pacienteId,
            LocalDateTime inicio,
            LocalDateTime fim
    );

    List<RegistroEmocional> findByPacienteIdOrderByRegistradoEmDesc(Long pacienteId);
}

