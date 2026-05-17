package com.psihub.api.shared.middleware;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psihub.api.shared.dto.ApiErrorDetail;
import com.psihub.api.shared.dto.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

@Component
public class SecurityErrorWriter {

    private final ObjectMapper objectMapper;

    public SecurityErrorWriter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        write(response, HttpStatus.UNAUTHORIZED, message, "UNAUTHORIZED");
    }

    public void writeForbidden(HttpServletResponse response, String message) throws IOException {
        write(response, HttpStatus.FORBIDDEN, message, "FORBIDDEN");
    }

    private void write(HttpServletResponse response, HttpStatus status, String message, String code) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(
                response.getWriter(),
                ApiResponse.error(message, List.of(ApiErrorDetail.of(message, code)))
        );
    }
}

