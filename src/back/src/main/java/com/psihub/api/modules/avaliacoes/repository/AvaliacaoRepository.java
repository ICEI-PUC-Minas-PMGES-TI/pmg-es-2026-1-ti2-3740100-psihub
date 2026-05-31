package com.psihub.api.modules.avaliacoes.repository;

import com.psihub.api.modules.avaliacoes.entity.Avaliacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    Optional<Avaliacao> findByConsultaId(Long consultaId);

    boolean existsByConsultaId(Long consultaId);

    List<Avaliacao> findByPsicologoId(Long psicologoId);

    @Query("select avg(a.nota) from Avaliacao a where a.psicologo.id = :psicologoId")
    Double findMediaByPsicologoId(@Param("psicologoId") Long psicologoId);

    @Query("select count(a) from Avaliacao a where a.psicologo.id = :psicologoId")
    long countByPsicologoId(@Param("psicologoId") Long psicologoId);
}
