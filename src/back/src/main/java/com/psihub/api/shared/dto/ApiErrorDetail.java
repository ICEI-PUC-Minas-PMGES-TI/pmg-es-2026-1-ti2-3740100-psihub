package com.psihub.api.shared.dto;

public record ApiErrorDetail(
        String field,
        String message,
        String code
) {
    public static ApiErrorDetail of(String message, String code) {
        return new ApiErrorDetail(null, message, code);
    }
}

