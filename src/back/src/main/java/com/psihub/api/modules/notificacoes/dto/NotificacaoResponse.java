package com.psihub.api.modules.notificacoes.dto;

import java.time.LocalDateTime;

public record NotificacaoResponse(
        Long id,
        String titulo,
        String mensagem,
        boolean lida,
        LocalDateTime criadoEm
) {}
