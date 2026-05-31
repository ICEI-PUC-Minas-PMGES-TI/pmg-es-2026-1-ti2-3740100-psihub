package com.psihub.api.modules.notificacoes.repository;

import com.psihub.api.modules.notificacoes.entity.Notificacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findByUsuarioIdOrderByCriadoEmDesc(Long usuarioId);

    List<Notificacao> findByUsuarioIdAndLidaOrderByCriadoEmDesc(Long usuarioId, boolean lida);
}

