package com.psihub.api.modules.psicologos.repository;

import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.shared.enums.StatusAcesso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PsicologoRepository extends JpaRepository<Psicologo, Long> {

    boolean existsByCrpIgnoreCase(String crp);

    @Query("""
            select distinct psicologo
            from Psicologo psicologo
            join fetch psicologo.usuario usuario
            left join fetch psicologo.especialidades especialidade
            where psicologo.statusAcesso <> :statusRevogado
              and usuario.ativo = true
            """)
    List<Psicologo> findDisponiveis(@Param("statusRevogado") StatusAcesso statusRevogado);

    @Query("""
            select distinct psicologo
            from Psicologo psicologo
            join fetch psicologo.usuario usuario
            left join fetch psicologo.especialidades especialidade
            where (:status is null or psicologo.statusAcesso = :status)
            order by usuario.nome asc
            """)
    List<Psicologo> findParaAdmin(@Param("status") StatusAcesso status);
}

