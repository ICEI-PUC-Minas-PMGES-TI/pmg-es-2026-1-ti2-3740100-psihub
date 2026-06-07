package com.psihub.api.modules.sessoes.dto;

import java.time.LocalDateTime;
import java.util.List;

// DTO mantido em sessoes por compor respostas do fluxo de sessao.
public record RegistroEmocionalResponse(
        Long id,
        Integer humorDia,
        String descricao,
        List<String> emocoes,
        LocalDateTime registradoEm,
        Long psicologoId
) {
}

