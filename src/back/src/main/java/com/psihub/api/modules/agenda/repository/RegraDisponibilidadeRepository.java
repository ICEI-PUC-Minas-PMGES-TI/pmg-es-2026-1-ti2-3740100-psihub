package com.psihub.api.modules.agenda.repository;

import com.psihub.api.modules.agenda.entity.RegraDisponibilidade;
import com.psihub.api.shared.enums.DiaSemana;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegraDisponibilidadeRepository extends JpaRepository<RegraDisponibilidade, Long> {

    List<RegraDisponibilidade> findByPsicologoIdAndAtivoTrueOrderByDiaSemanaAscHoraInicioAsc(Long psicologoId);

    List<RegraDisponibilidade> findByPsicologoIdAndDiaSemanaAndAtivoTrueOrderByIdDesc(Long psicologoId, DiaSemana diaSemana);
}

