package psihub.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import psihub.domain.enums.StatusAcesso;
import psihub.domain.model.Psicologo;

public interface PsicologoRepository extends JpaRepository<Psicologo, Long> {

    @Query("""
            select distinct psicologo
            from Psicologo psicologo
            join fetch psicologo.usuario usuario
            left join fetch psicologo.especialidades especialidade
            where psicologo.statusAcesso = :status
              and usuario.ativo = true
            """)
    List<Psicologo> findDisponiveis(@Param("status") StatusAcesso status);
}
