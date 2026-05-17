package com.psihub.api.shared.middleware;

import com.psihub.api.shared.enums.TipoUsuario;
import org.springframework.lang.NonNull;

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

