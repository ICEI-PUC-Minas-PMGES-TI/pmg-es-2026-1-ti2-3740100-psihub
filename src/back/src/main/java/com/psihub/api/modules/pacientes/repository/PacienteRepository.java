package com.psihub.api.modules.pacientes.repository;

import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.vinculos.entity.StatusVinculo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    @Query("""
            select distinct paciente
            from Paciente paciente
            join fetch paciente.usuario usuario
            join paciente.vinculos vinculo
            where vinculo.psicologo.id = :psicologoId
              and vinculo.status = :status
              and (:nome is null or lower(usuario.nome) like :nome)
            order by usuario.nome asc
            """)
    List<Paciente> findByPsicologoId(
            @Param("psicologoId") Long psicologoId,
            @Param("status") StatusVinculo status,
            @Param("nome") String nome
    );
}

