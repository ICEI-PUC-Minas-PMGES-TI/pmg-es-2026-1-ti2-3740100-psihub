package com.psihub.api.modules.auth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.shared.enums.TipoUsuario;
import com.psihub.api.shared.middleware.AuthenticatedUser;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final byte[] secret;
    private final long expirationSeconds;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${app.security.jwt-secret}") String jwtSecret,
            @Value("${app.security.jwt-expiration-days}") long expirationDays
    ) {
        String normalizedSecret = jwtSecret == null ? "" : jwtSecret.trim();
        if (normalizedSecret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET deve ser definido com pelo menos 32 caracteres");
        }

        this.objectMapper = objectMapper;
        this.clock = Clock.systemUTC();
        this.secret = normalizedSecret.getBytes(StandardCharsets.UTF_8);
        this.expirationSeconds = expirationDays * 24 * 60 * 60;
    }

    public String generateToken(Usuario usuario) {
        Instant now = Instant.now(clock);
        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", String.valueOf(usuario.getId()));
        payload.put("userId", usuario.getId());
        payload.put("email", usuario.getEmail());
        payload.put("tipo", toPayloadTipo(usuario.getTipoUsuario()));
        if (usuario.getTipoUsuario() == TipoUsuario.PACIENTE) {
            payload.put("pacienteId", usuario.getId());
        } else if (usuario.getTipoUsuario() == TipoUsuario.PSICOLOGO) {
            payload.put("psicologoId", usuario.getId());
        }
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusSeconds(expirationSeconds).getEpochSecond());

        String unsignedToken = encodeJson(header) + "." + encodeJson(payload);
        return unsignedToken + "." + sign(unsignedToken);
    }

    public AuthenticatedUser validate(String token) {
        String[] chunks = token == null ? new String[0] : token.split("\\.");
        if (chunks.length != 3) {
            throw new JwtValidationException("Token inválido");
        }

        String unsignedToken = chunks[0] + "." + chunks[1];
        String expectedSignature = sign(unsignedToken);
        if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), chunks[2].getBytes(StandardCharsets.UTF_8))) {
            throw new JwtValidationException("Token inválido");
        }

        Map<String, Object> header = decodeJson(chunks[0]);
        if (!"HS256".equals(header.get("alg"))) {
            throw new JwtValidationException("Token inválido");
        }

        Map<String, Object> payload = decodeJson(chunks[1]);
        long expiresAt = readLong(payload.get("exp"));
        if (Instant.now(clock).getEpochSecond() >= expiresAt) {
            throw new JwtValidationException("Token expirado");
        }

        long userId = payload.containsKey("userId") ? readLong(payload.get("userId")) : readLong(payload.get("sub"));
        String email = readString(payload.get("email"));
        TipoUsuario tipo = toTipoUsuario(readString(payload.get("tipo")));

        return new AuthenticatedUser(userId, email, tipo);
    }

    private String encodeJson(Map<String, Object> value) {
        try {
            return base64UrlEncoder().encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (Exception exception) {
            throw new IllegalStateException("Não foi possível gerar token", exception);
        }
    }

    private Map<String, Object> decodeJson(String value) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(value);
            return objectMapper.readValue(decoded, MAP_TYPE);
        } catch (Exception exception) {
            throw new JwtValidationException("Token inválido");
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return base64UrlEncoder().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Não foi possível assinar token", exception);
        }
    }

    private Base64.Encoder base64UrlEncoder() {
        return Base64.getUrlEncoder().withoutPadding();
    }

    private Long readLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text) {
            return Long.parseLong(text);
        }
        throw new JwtValidationException("Token inválido");
    }

    private String readString(Object value) {
        if (value instanceof String text && !text.isBlank()) {
            return text;
        }
        throw new JwtValidationException("Token inválido");
    }

    private String toPayloadTipo(TipoUsuario tipoUsuario) {
        return tipoUsuario.name().toLowerCase(Locale.ROOT);
    }

    private TipoUsuario toTipoUsuario(String tipo) {
        try {
            return TipoUsuario.valueOf(tipo.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new JwtValidationException("Token inválido");
        }
    }
}

