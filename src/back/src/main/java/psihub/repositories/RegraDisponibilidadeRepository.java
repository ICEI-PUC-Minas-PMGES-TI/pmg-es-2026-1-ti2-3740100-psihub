package psihub.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import psihub.domain.enums.DiaSemana;
import psihub.domain.model.RegraDisponibilidade;

public interface RegraDisponibilidadeRepository extends JpaRepository<RegraDisponibilidade, Long> {

    List<RegraDisponibilidade> findByPsicologoIdAndAtivoTrueOrderByDiaSemanaAscHoraInicioAsc(Long psicologoId);

    List<RegraDisponibilidade> findByPsicologoIdAndDiaSemanaAndAtivoTrueOrderByIdDesc(Long psicologoId, DiaSemana diaSemana);
}
