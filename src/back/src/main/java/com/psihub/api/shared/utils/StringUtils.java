package com.psihub.api.shared.utils;

public final class StringUtils {

    private StringUtils() {
    }

    public static String sanitizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        return normalized.isBlank() ? null : normalized;
    }
}
