package com.psihub.api.modules.vinculos.repository;

import com.psihub.api.modules.vinculos.entity.StatusVinculo;
import com.psihub.api.modules.vinculos.entity.VinculoPsicologoPaciente;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VinculoPsicologoPacienteRepository extends JpaRepository<VinculoPsicologoPaciente, Long> {

    Optional<VinculoPsicologoPaciente> findByPacienteIdAndPsicologoId(Long pacienteId, Long psicologoId);

    boolean existsByPacienteIdAndPsicologoIdAndStatus(Long pacienteId, Long psicologoId, StatusVinculo status);

    @Query("""
            select vinculo
            from VinculoPsicologoPaciente vinculo
            join fetch vinculo.paciente paciente
            join fetch paciente.usuario pacienteUsuario
            join fetch vinculo.psicologo psicologo
            join fetch psicologo.usuario psicologoUsuario
            where psicologo.id = :psicologoId
              and (:status is null or vinculo.status = :status)
            order by vinculo.solicitadoEm desc
            """)
    List<VinculoPsicologoPaciente> findByPsicologoAndStatus(
            @Param("psicologoId") Long psicologoId,
            @Param("status") StatusVinculo status
    );
}
