package com.psihub.api.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RegisterRequest(
        @NotBlank @Size(max = 150) String nome,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 8, max = 120) String senha,
        @NotBlank @Size(min = 8, max = 120) String confirmarSenha,
        @Size(max = 30) String telefone,
        LocalDate dataNascimento,
        @NotBlank @Pattern(regexp = "(?i)paciente|psicologo") String tipo,
        @Size(max = 30) String crp,
        @DecimalMin("0.00") BigDecimal valorConsulta,
        @Size(max = 500) String biografia,
        List<@Size(max = 100) String> especialidades
) {
}

