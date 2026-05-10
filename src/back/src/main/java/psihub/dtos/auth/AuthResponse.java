package psihub.dtos.auth;

public record AuthResponse(
        String token,
        AuthUserResponse user,
        Integer expiresInDays
) {
}
