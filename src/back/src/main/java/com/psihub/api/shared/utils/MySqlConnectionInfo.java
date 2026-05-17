package com.psihub.api.shared.utils;

public record MySqlConnectionInfo(
        String productName,
        String productVersion,
        String url,
        String username,
        boolean valid
) {
}

