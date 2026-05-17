package com.psihub.api.modules.auth.dto;

public record AuthResponse(
        String token,
        AuthUserResponse user,
        Integer expiresInDays
) {
}

