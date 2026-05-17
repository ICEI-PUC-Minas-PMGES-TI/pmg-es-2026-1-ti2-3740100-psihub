package com.psihub.api.modules.pacientes.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PacientePerfilRequest(
        @Size(max = 150) String nome,
        @Size(max = 30) String telefone,
        @Size(max = 500) String fotoPerfilUrl,
        LocalDate dataNascimento,
        @Size(max = 300) String observacoesIniciais
) {
}
