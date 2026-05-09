package psihub.dtos.common;

import java.time.LocalDateTime;
import java.util.List;

public record ApiResponse<T>(
        boolean success,
        T data,
        String message,
        ResponseMeta meta,
        List<ApiErrorDetail> errors,
        LocalDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data, String message, ResponseMeta meta) {
        return new ApiResponse<>(
                true,
                data,
                message,
                meta,
                List.of(),
                LocalDateTime.now()
        );
    }

    public static ApiResponse<Object> error(String message, List<ApiErrorDetail> errors) {
        return new ApiResponse<>(
                false,
                null,
                message,
                null,
                errors == null ? List.of() : errors,
                LocalDateTime.now()
        );
    }
}
