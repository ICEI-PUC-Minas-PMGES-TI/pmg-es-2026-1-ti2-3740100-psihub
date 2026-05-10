package psihub.repositories;

import java.time.LocalDateTime;
import java.util.Collection;
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
              and consulta.ativo = true
              and consulta.status in :statuses
              and slot.inicioEm >= :inicio
              and slot.inicioEm < :fim
            order by slot.inicioEm asc
            """)
    List<Consulta> findByFiltros(
            @Param("pacienteId") Long pacienteId,
            @Param("psicologoId") Long psicologoId,
            @Param("statuses") Collection<StatusConsulta> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
            select count(consulta) > 0
            from Consulta consulta
            join consulta.slotConsulta slot
            where consulta.psicologo.id = :psicologoId
              and consulta.ativo = true
              and slot.ativo = true
              and consulta.status not in :ignoredStatuses
              and slot.inicioEm < :fim
              and slot.fimEm > :inicio
            """)
    boolean existsBlockingOverlap(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("ignoredStatuses") Collection<StatusConsulta> ignoredStatuses
    );

    Optional<Consulta> findFirstByPacienteIdAndPsicologoIdAndSlotConsultaInicioEmBeforeAndStatusOrderBySlotConsultaInicioEmDesc(
            Long pacienteId,
            Long psicologoId,
            LocalDateTime antesDe,
            StatusConsulta status
    );
}
