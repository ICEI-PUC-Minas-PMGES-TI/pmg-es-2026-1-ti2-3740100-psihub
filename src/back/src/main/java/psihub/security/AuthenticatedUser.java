package psihub.security;

import psihub.domain.enums.TipoUsuario;

public record AuthenticatedUser(
        Long userId,
        String email,
        TipoUsuario tipo
) {
    public boolean isPaciente() {
        return tipo == TipoUsuario.PACIENTE;
    }

    public boolean isPsicologo() {
        return tipo == TipoUsuario.PSICOLOGO;
    }
}
