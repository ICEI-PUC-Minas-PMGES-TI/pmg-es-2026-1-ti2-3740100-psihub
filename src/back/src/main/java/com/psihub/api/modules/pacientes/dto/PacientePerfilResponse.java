package com.psihub.api.modules.pacientes.dto;

import java.time.LocalDate;

public record PacientePerfilResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        String fotoPerfilUrl,
        LocalDate dataNascimento,
        String observacoesIniciais
) {
}
