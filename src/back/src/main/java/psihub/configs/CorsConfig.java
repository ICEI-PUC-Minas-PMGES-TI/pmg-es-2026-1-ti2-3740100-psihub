package psihub.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final @NonNull String[] allowedOriginPatterns;

    public CorsConfig(
            @Value("${app.cors.allowed-origin-patterns:http://localhost:*,http://127.0.0.1:*}")
                @NonNull String[] allowedOriginPatterns
    ) {
        this.allowedOriginPatterns = allowedOriginPatterns;
    }

    @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOriginPatterns(allowedOriginPatterns)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);

        registry.addMapping("/auth/**")
            .allowedOriginPatterns(allowedOriginPatterns)
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .maxAge(3600);
    }
}
