package com.psihub.api.modules.sessoes.repository;

import com.psihub.api.modules.sessoes.entity.ProntuarioSessao;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
            where paciente.id = :pacienteId
              and psicologo.id = :psicologoId
              and prontuario.incluirLinhaTempo = true
              and consulta.inicioEm >= :inicio
              and consulta.inicioEm < :fim
              and (:tema is null or lower(prontuario.temasSessao) like lower(concat('%', :tema, '%')))
            order by consulta.inicioEm asc
            """)
    List<ProntuarioSessao> findLinhaTempo(
            @Param("pacienteId") Long pacienteId,
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("tema") String tema
    );
}

