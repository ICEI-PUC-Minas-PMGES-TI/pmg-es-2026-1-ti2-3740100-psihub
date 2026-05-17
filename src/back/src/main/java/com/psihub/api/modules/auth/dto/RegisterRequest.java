package com.psihub.api.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank @Size(max = 150) String nome,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 8, max = 120) String senha,
        @NotBlank @Size(min = 8, max = 120) String confirmarSenha,
        @Size(max = 30) String telefone,
        LocalDate dataNascimento,
        @NotBlank @Pattern(regexp = "(?i)paciente|psicologo") String tipo
) {
}

