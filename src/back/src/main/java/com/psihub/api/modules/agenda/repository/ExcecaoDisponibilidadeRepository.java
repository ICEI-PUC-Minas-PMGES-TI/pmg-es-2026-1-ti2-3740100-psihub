package com.psihub.api.modules.agenda.repository;

import com.psihub.api.modules.agenda.entity.ExcecaoDisponibilidade;
import com.psihub.api.modules.agenda.entity.TipoExcecaoDisponibilidade;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExcecaoDisponibilidadeRepository extends JpaRepository<ExcecaoDisponibilidade, Long> {

    List<ExcecaoDisponibilidade> findByPsicologoIdAndDataAndAtivoTrue(Long psicologoId, LocalDate data);

    List<ExcecaoDisponibilidade> findByPsicologoIdAndDataAndTipoAndAtivoTrue(
            Long psicologoId,
            LocalDate data,
            TipoExcecaoDisponibilidade tipo
    );

    List<ExcecaoDisponibilidade> findByPsicologoIdAndDataBetweenAndAtivoTrue(
            Long psicologoId,
            LocalDate dataInicio,
            LocalDate dataFim
    );
}
