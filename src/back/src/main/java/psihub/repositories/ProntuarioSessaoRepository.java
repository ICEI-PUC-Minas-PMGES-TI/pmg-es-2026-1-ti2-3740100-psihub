package psihub.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import psihub.domain.model.ProntuarioSessao;

public interface ProntuarioSessaoRepository extends JpaRepository<ProntuarioSessao, Long> {

    Optional<ProntuarioSessao> findByConsultaId(Long consultaId);

    @Query("""
            select prontuario
            from ProntuarioSessao prontuario
            join fetch prontuario.consulta consulta
            join fetch consulta.paciente paciente
            join fetch paciente.usuario pacienteUsuario
            join fetch consulta.psicologo psicologo
            join fetch psicologo.usuario psicologoUsuario
            join fetch consulta.slotConsulta slot
            where prontuario.id = :id
            """)
    Optional<ProntuarioSessao> findDetailedById(@Param("id") Long id);

    @Query("""
            select prontuario
            from ProntuarioSessao prontuario
            join fetch prontuario.consulta consulta
            join fetch consulta.paciente paciente
            join fetch paciente.usuario pacienteUsuario
            join fetch consulta.psicologo psicologo
            join fetch psicologo.usuario psicologoUsuario
            join fetch consulta.slotConsulta slot
            where paciente.id = :pacienteId
              and psicologo.id = :psicologoId
              and prontuario.incluirLinhaTempo = true
              and slot.inicioEm >= :inicio
              and slot.inicioEm < :fim
              and (:tema is null or lower(prontuario.temasSessao) like lower(concat('%', :tema, '%')))
            order by slot.inicioEm asc
            """)
    List<ProntuarioSessao> findLinhaTempo(
            @Param("pacienteId") Long pacienteId,
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("tema") String tema
    );
}
