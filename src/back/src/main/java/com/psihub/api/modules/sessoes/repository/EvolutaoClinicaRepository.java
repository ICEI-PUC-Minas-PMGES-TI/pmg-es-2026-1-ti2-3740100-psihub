package com.psihub.api.modules.sessoes.repository;

import com.psihub.api.modules.sessoes.entity.EvolutaoClinica;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvolutaoClinicaRepository extends JpaRepository<EvolutaoClinica, Long> {
    List<EvolutaoClinica> findByPacienteIdAndAtivoTrueOrderByCriadoEmDesc(Long pacienteId);

    List<EvolutaoClinica> findByPacienteIdAndCriadoEmBetweenAndAtivoTrueOrderByCriadoEmDesc(
        Long pacienteId,
        LocalDateTime inicio,
        LocalDateTime fim
    );
}

