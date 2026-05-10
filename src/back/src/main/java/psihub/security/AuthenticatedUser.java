package psihub.security;

import org.springframework.lang.NonNull;
import psihub.domain.enums.TipoUsuario;

public record AuthenticatedUser(
        @NonNull Long userId,
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
