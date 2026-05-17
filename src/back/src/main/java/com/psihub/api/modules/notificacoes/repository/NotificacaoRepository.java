package com.psihub.api.modules.notificacoes.repository;

import com.psihub.api.modules.notificacoes.entity.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
}

