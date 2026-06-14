package com.psihub.api.modules.consultas.repository;

import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.indicadores.dto.ConsultasMensaisPacienteProjection;
import com.psihub.api.shared.enums.StatusConsulta;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    @Query("""
            select consulta
            from Consulta consulta
            join fetch consulta.paciente paciente
            join fetch paciente.usuario pacienteUsuario
            join fetch consulta.psicologo psicologo
            join fetch psicologo.usuario psicologoUsuario
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
            join fetch consulta.agendadoPorUsuario agendadoPor
            where (:pacienteId is null or paciente.id = :pacienteId)
              and (:psicologoId is null or psicologo.id = :psicologoId)
              and consulta.ativo = true
              and consulta.status in :statuses
              and consulta.inicioEm >= :inicio
              and consulta.inicioEm < :fim
            order by consulta.inicioEm asc
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
            where consulta.psicologo.id = :psicologoId
              and consulta.ativo = true
              and consulta.status not in :ignoredStatuses
              and consulta.inicioEm < :fim
              and consulta.fimEm > :inicio
            """)
    boolean existsBlockingOverlap(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("ignoredStatuses") Collection<StatusConsulta> ignoredStatuses
    );

    @Query("""
            select consulta
            from Consulta consulta
            where consulta.paciente.id = :pacienteId
              and consulta.psicologo.id = :psicologoId
              and consulta.inicioEm < :antesDe
              and consulta.status = :status
              and consulta.ativo = true
            order by consulta.inicioEm desc
            limit 1
            """)
    Optional<Consulta> findFirstByPacienteIdAndPsicologoIdAndInicioEmBeforeAndStatusOrderByInicioEmDesc(
            @Param("pacienteId") Long pacienteId,
            @Param("psicologoId") Long psicologoId,
            @Param("antesDe") LocalDateTime antesDe,
            @Param("status") StatusConsulta status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select consulta
            from Consulta consulta
            where consulta.psicologo.id = :psicologoId
              and consulta.ativo = true
              and consulta.status not in :ignoredStatuses
              and consulta.inicioEm < :fim
              and consulta.fimEm > :inicio
            order by consulta.inicioEm asc
            """)
    List<Consulta> findBlockingConsultasForUpdate(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("ignoredStatuses") Collection<StatusConsulta> ignoredStatuses
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select consulta
            from Consulta consulta
            where consulta.psicologo.id = :psicologoId
              and consulta.id <> :consultaId
              and consulta.ativo = true
              and consulta.status not in :ignoredStatuses
              and consulta.inicioEm < :fim
              and consulta.fimEm > :inicio
            order by consulta.inicioEm asc
            """)
    List<Consulta> findBlockingConsultasForUpdateExcludingId(
            @Param("consultaId") Long consultaId,
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("ignoredStatuses") Collection<StatusConsulta> ignoredStatuses
    );

    @Query(value = """
            select count(distinct paciente_id)
            from consultas
            where psicologo_id = :psicologoId
              and ativo = b'1'
              and status = 'CONCLUIDA'
              and inicio_em >= :inicio
              and inicio_em < :fim
            """, nativeQuery = true)
    long countPacientesComConsultaConcluida(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query(value = """
            select count(*)
            from (
                select paciente_id
                from consultas
                where psicologo_id = :psicologoId
                  and ativo = b'1'
                  and status = 'CONCLUIDA'
                  and inicio_em >= :inicio
                  and inicio_em < :fim
                group by paciente_id
                having count(*) >= 2
            ) pacientes_retorno
            """, nativeQuery = true)
    long countPacientesComRetorno(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query(value = """
            select
                consulta.paciente_id as pacienteId,
                usuario.nome as pacienteNome,
                year(consulta.inicio_mes) as ano,
                month(consulta.inicio_mes) as mes,
                count(*) as totalConsultas
            from consultas consulta
            join pacientes paciente on paciente.id = consulta.paciente_id
            join usuarios usuario on usuario.id = paciente.id
            where consulta.psicologo_id = :psicologoId
              and consulta.ativo = b'1'
              and consulta.status = 'CONCLUIDA'
              and consulta.inicio_em >= :inicio
              and consulta.inicio_em < :fim
            group by consulta.paciente_id, usuario.nome, consulta.inicio_mes
            order by consulta.inicio_mes asc, usuario.nome asc
            """, nativeQuery = true)
    List<ConsultasMensaisPacienteProjection> findConsultasMensaisPorPaciente(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}
