package psihub.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import psihub.domain.enums.StatusVinculo;
import psihub.domain.model.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    @Query("""
            select paciente
            from Paciente paciente
            join fetch paciente.usuario usuario
            join paciente.vinculos vinculo
            where vinculo.psicologo.id = :psicologoId
              and vinculo.status = :statusVinculo
              and (:nome is null or lower(usuario.nome) like lower(concat('%', :nome, '%')))
            order by usuario.nome asc
            """)
    List<Paciente> findByPsicologoIdAndVinculo(
            @Param("psicologoId") Long psicologoId,
            @Param("statusVinculo") StatusVinculo statusVinculo,
            @Param("nome") String nome
    );
}
