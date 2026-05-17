package com.psihub.api.shared.config;

import com.psihub.api.shared.middleware.JwtAuthenticationFilter;
import com.psihub.api.shared.middleware.SecurityErrorWriter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            SecurityErrorWriter securityErrorWriter
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {
                })
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) ->
                                securityErrorWriter.writeUnauthorized(response, "Faca login para continuar"))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                securityErrorWriter.writeForbidden(response, "Voce nao tem permissao para acessar esta area"))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/auth/register", "/auth/login").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/pacientes/me/**").hasRole("PACIENTE")
                        .requestMatchers("/api/psicologos/me/**").hasRole("PSICOLOGO")
                        .requestMatchers(HttpMethod.GET, "/api/psicologos/disponiveis").hasRole("PACIENTE")
                        .requestMatchers(HttpMethod.GET, "/api/psicologos/*/agenda/slots-publicos").hasRole("PACIENTE")
                        .requestMatchers(HttpMethod.GET, "/api/psicologos/*/agenda/slots/disponiveis").hasRole("PACIENTE")
                        .requestMatchers("/api/consultas/**").hasAnyRole("PACIENTE", "PSICOLOGO")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}

