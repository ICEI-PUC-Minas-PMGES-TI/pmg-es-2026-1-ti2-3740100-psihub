package psihub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import psihub.domain.model.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
}
