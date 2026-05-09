package psihub.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import psihub.domain.enums.StatusConsulta;
import psihub.domain.model.Consulta;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    @Query("""
            select consulta
            from Consulta consulta
            join fetch consulta.paciente paciente
            join fetch paciente.usuario pacienteUsuario
            join fetch consulta.psicologo psicologo
            join fetch psicologo.usuario psicologoUsuario
            join fetch consulta.slotConsulta slot
            join fetch consulta.agendadoPorUsuario agendadoPor
            where consulta.id = :id
            """)
    Optional<Consulta> findDetailedById(@Param("id") Long id);

    @Query("""
            select consulta
            from Consulta consulta
            join fetch consulta.paciente paciente
            join fetch paciente.usuario pacienteUsuario
            join fetch consulta.psicologo psicologo
            join fetch psicologo.usuario psicologoUsuario
            join fetch consulta.slotConsulta slot
            join fetch consulta.agendadoPorUsuario agendadoPor
            where (:pacienteId is null or paciente.id = :pacienteId)
              and (:psicologoId is null or psicologo.id = :psicologoId)
              and (:status is null or consulta.status = :status)
              and slot.inicioEm >= :inicio
              and slot.inicioEm < :fim
            order by slot.inicioEm asc
            """)
    List<Consulta> findByFiltros(
            @Param("pacienteId") Long pacienteId,
            @Param("psicologoId") Long psicologoId,
            @Param("status") StatusConsulta status,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    Optional<Consulta> findFirstByPacienteIdAndPsicologoIdAndSlotConsultaInicioEmBeforeAndStatusOrderBySlotConsultaInicioEmDesc(
            Long pacienteId,
            Long psicologoId,
            LocalDateTime antesDe,
            StatusConsulta status
    );
}
