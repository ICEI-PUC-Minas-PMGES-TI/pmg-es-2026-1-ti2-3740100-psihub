package psihub.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import psihub.domain.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);
}
