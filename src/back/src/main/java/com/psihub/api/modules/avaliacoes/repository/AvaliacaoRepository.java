package com.psihub.api.modules.avaliacoes.repository;

import com.psihub.api.modules.avaliacoes.entity.Avaliacao;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    Optional<Avaliacao> findByConsultaId(Long consultaId);

    boolean existsByConsultaId(Long consultaId);

    @Query("""
            select avaliacao
            from Avaliacao avaliacao
            join fetch avaliacao.consulta consulta
            join fetch avaliacao.paciente paciente
            join fetch paciente.usuario pacienteUsuario
            join fetch avaliacao.psicologo psicologo
            join fetch psicologo.usuario psicologoUsuario
            where consulta.id = :consultaId
              and avaliacao.ativo = true
              and consulta.ativo = true
            """)
    Optional<Avaliacao> findDetailedByConsultaId(@Param("consultaId") Long consultaId);

    @Query("""
            select avaliacao
            from Avaliacao avaliacao
            join fetch avaliacao.consulta consulta
            join fetch avaliacao.paciente paciente
            join fetch paciente.usuario pacienteUsuario
            join fetch avaliacao.psicologo psicologo
            join fetch psicologo.usuario psicologoUsuario
            where psicologo.id = :psicologoId
              and avaliacao.ativo = true
              and consulta.ativo = true
            order by avaliacao.avaliadoEm desc
            """)
    List<Avaliacao> findByPsicologoId(@Param("psicologoId") Long psicologoId);

    @Query("""
            select avg(a.nota)
            from Avaliacao a
            where a.psicologo.id = :psicologoId
              and a.ativo = true
              and a.consulta.ativo = true
            """)
    Double findMediaByPsicologoId(@Param("psicologoId") Long psicologoId);

    @Query("""
            select count(a)
            from Avaliacao a
            where a.psicologo.id = :psicologoId
              and a.ativo = true
              and a.consulta.ativo = true
            """)
    long countByPsicologoId(@Param("psicologoId") Long psicologoId);

    @Query("""
            select avg(a.nota)
            from Avaliacao a
            where a.psicologo.id = :psicologoId
              and a.ativo = true
              and a.consulta.ativo = true
              and a.avaliadoEm >= :inicio
              and a.avaliadoEm < :fim
            """)
    Double avgNotaByPsicologoAndPeriodo(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
            select count(a)
            from Avaliacao a
            where a.psicologo.id = :psicologoId
              and a.ativo = true
              and a.consulta.ativo = true
              and a.avaliadoEm >= :inicio
              and a.avaliadoEm < :fim
            """)
    long countByPsicologoAndPeriodo(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}
