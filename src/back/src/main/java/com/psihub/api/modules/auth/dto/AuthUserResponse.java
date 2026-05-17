package com.psihub.api.modules.auth.dto;

public record AuthUserResponse(
        String nome,
        String email,
        String tipo,
        String cargo,
        String crp
) {
}

