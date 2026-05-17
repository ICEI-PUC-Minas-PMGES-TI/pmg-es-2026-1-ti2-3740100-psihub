package com.psihub.api.modules.psicologos.repository;

import com.psihub.api.modules.psicologos.entity.EspecialidadePsicologo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EspecialidadePsicologoRepository extends JpaRepository<EspecialidadePsicologo, Long> {

    List<EspecialidadePsicologo> findByPsicologoId(Long psicologoId);

    @Query(value = "select * from especialidades_psicologo where psicologo_id = :psicologoId", nativeQuery = true)
    List<EspecialidadePsicologo> findAllByPsicologoIdIncludingInactive(@Param("psicologoId") Long psicologoId);
}

