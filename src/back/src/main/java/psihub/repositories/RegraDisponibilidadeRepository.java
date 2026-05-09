package psihub.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import psihub.domain.model.RegraDisponibilidade;

public interface RegraDisponibilidadeRepository extends JpaRepository<RegraDisponibilidade, Long> {

    List<RegraDisponibilidade> findByPsicologoIdOrderByDiaSemanaAscHoraInicioAsc(Long psicologoId);
}
