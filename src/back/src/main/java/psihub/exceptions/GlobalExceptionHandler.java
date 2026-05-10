package psihub.exceptions;

import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import psihub.dtos.common.ApiErrorDetail;
import psihub.dtos.common.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApiException(ApiException exception) {
        return build(
                exception.getStatus(),
                exception.getMessage(),
                List.of(ApiErrorDetail.of(exception.getMessage(), exception.getStatus().name()))
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException exception) {
        List<ApiErrorDetail> details = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new ApiErrorDetail(error.getField(), error.getDefaultMessage(), "VALIDATION_ERROR"))
                .toList();

        return build(HttpStatus.BAD_REQUEST, "Requisicao invalida", details);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException exception) {
        List<ApiErrorDetail> details = exception.getConstraintViolations()
                .stream()
                .map(violation -> new ApiErrorDetail(
                        violation.getPropertyPath().toString(),
                        violation.getMessage(),
                        "VALIDATION_ERROR"
                ))
                .toList();

        return build(HttpStatus.BAD_REQUEST, "Requisicao invalida", details);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException exception) {
        return build(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                List.of(ApiErrorDetail.of(exception.getMessage(), "BAD_REQUEST"))
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrity(DataIntegrityViolationException exception) {
        String message = "Operacao viola uma restricao de integridade dos dados";
        return build(
                HttpStatus.CONFLICT,
                message,
                List.of(ApiErrorDetail.of(message, "DATA_INTEGRITY_VIOLATION"))
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleMessageNotReadable(HttpMessageNotReadableException exception) {
        String cause = exception.getMostSpecificCause().getMessage();
        String message = cause != null && cause.length() < 200
                ? "Corpo da requisicao invalido: " + cause
                : "Corpo da requisicao invalido";
        return build(
                HttpStatus.BAD_REQUEST,
                message,
                List.of(ApiErrorDetail.of(message, "INVALID_REQUEST_BODY"))
        );
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Object>> handleMissingParameter(MissingServletRequestParameterException exception) {
        String message = "Parametro obrigatorio ausente";
        return build(
                HttpStatus.BAD_REQUEST,
                message,
                List.of(new ApiErrorDetail(exception.getParameterName(), message, "MISSING_PARAMETER"))
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        String message = "Parametro com tipo invalido";
        return build(
                HttpStatus.BAD_REQUEST,
                message,
                List.of(new ApiErrorDetail(exception.getName(), message, "TYPE_MISMATCH"))
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception exception) {
        String message = "Erro interno no servidor";
        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                message,
                List.of(ApiErrorDetail.of(message, "INTERNAL_SERVER_ERROR"))
        );
    }

    private ResponseEntity<ApiResponse<Object>> build(
            HttpStatus status,
            String message,
            List<ApiErrorDetail> details
    ) {
        return ResponseEntity.status(status).body(ApiResponse.error(message, details));
    }
}
