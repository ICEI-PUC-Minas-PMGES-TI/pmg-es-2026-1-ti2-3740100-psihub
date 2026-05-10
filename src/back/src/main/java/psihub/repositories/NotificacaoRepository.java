package psihub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import psihub.domain.model.Notificacao;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
}
