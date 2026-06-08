package com.psihub.api.shared.utils;

import com.psihub.api.shared.exception.ApiException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import org.springframework.http.HttpStatus;

public final class DateTimeParser {

    private DateTimeParser() {
    }

    public static LocalDateTime parseDateTimeOrDefault(String value, LocalDateTime defaultValue, boolean fim) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return parseDateTime(value, fim);
    }

    public static LocalDateTime parseRequiredDateTime(String value, String nomeParametro, boolean fim) {
        if (value == null || value.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Parâmetro obrigatório ausente: " + nomeParametro);
        }
        return parseDateTime(value, fim);
    }

    private static LocalDateTime parseDateTime(String value, boolean fim) {
        try {
            return LocalDateTime.parse(value.trim());
        } catch (DateTimeParseException ignored) {
            try {
                LocalDate data = LocalDate.parse(value.trim());
                return fim ? data.plusDays(1).atStartOfDay() : data.atStartOfDay();
            } catch (DateTimeParseException exception) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Parâmetro de data/hora inválido");
            }
        }
    }
}
