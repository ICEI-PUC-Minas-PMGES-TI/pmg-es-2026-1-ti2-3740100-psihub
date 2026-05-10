package psihub.dtos.auth;

public record AuthUserResponse(
        String nome,
        String email,
        String tipo,
        String cargo,
        String crp
) {
}
