package com.psihub.api.shared.middleware;

import com.psihub.api.modules.auth.service.JwtService;
import com.psihub.api.modules.auth.service.JwtValidationException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final SecurityErrorWriter securityErrorWriter;

    public JwtAuthenticationFilter(JwtService jwtService, SecurityErrorWriter securityErrorWriter) {
        this.jwtService = jwtService;
        this.securityErrorWriter = securityErrorWriter;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization == null || authorization.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!authorization.startsWith("Bearer ")) {
            securityErrorWriter.writeUnauthorized(response, "Informe um token de acesso valido");
            return;
        }

        try {
            AuthenticatedUser user = jwtService.validate(authorization.substring(7).trim());
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.tipo().name()))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);
        } catch (JwtValidationException exception) {
            SecurityContextHolder.clearContext();
            securityErrorWriter.writeUnauthorized(response, "Sua sessao expirou ou e invalida");
        }
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return request.getServletPath().startsWith("/auth/");
    }
}

