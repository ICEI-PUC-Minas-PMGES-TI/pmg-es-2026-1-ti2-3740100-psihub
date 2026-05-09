package psihub.repositories;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import psihub.domain.model.RegistroEmocional;

public interface RegistroEmocionalRepository extends JpaRepository<RegistroEmocional, Long> {

    List<RegistroEmocional> findByPacienteIdAndRegistradoEmBetweenOrderByRegistradoEmAsc(
            Long pacienteId,
            LocalDateTime inicio,
            LocalDateTime fim
    );
}
