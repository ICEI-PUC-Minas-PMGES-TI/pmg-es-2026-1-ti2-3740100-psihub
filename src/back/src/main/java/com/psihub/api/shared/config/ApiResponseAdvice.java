package com.psihub.api.shared.config;

import com.psihub.api.shared.dto.ApiResponse;
import com.psihub.api.shared.dto.ResponseMeta;
import java.util.Collection;
import org.springframework.core.MethodParameter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.MediaType;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice(basePackages = "com.psihub.api.modules")
public class ApiResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(@NonNull MethodParameter returnType, @NonNull Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(
            @Nullable Object body,
            @NonNull MethodParameter returnType,
            @NonNull MediaType selectedContentType,
            @NonNull Class<? extends HttpMessageConverter<?>> selectedConverterType,
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response
    ) {
        if (body instanceof ApiResponse<?>) {
            return body;
        }

        ResponseMeta meta = body instanceof Collection<?> collection
                ? ResponseMeta.list(collection.size())
                : null;

        return ApiResponse.success(body, "Operacao realizada com sucesso", meta);
    }
}

