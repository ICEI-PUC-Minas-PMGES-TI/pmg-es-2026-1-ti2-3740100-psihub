package psihub.dtos.common;

public record ApiErrorDetail(
        String field,
        String message,
        String code
) {
    public static ApiErrorDetail of(String message, String code) {
        return new ApiErrorDetail(null, message, code);
    }
}
