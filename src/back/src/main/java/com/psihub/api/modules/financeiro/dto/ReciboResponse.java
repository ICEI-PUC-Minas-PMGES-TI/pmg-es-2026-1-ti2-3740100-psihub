package com.psihub.api.modules.financeiro.dto;

import java.time.LocalDateTime;

public record ReciboResponse(
        Long id,
        String numeroRecibo,
        String arquivoUrl,
        LocalDateTime emitidoEm
) {}
