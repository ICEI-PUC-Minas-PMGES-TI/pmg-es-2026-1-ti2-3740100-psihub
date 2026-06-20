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
            SecurityErrorWriter securityErrorWriter,
            org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) ->
                                securityErrorWriter.writeUnauthorized(response, "Faca login para continuar"))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                securityErrorWriter.writeForbidden(response, "Você não tem permissão para acessar esta área"))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                HttpMethod.GET,
                                "/",
                                "/index.html",
                                "/assets/**",
                                "/favicon.ico",
                                "/manifest.webmanifest",
                                "/robots.txt"
                        ).permitAll()
                        .requestMatchers(
                                HttpMethod.POST,
                                "/auth/register",
                                "/auth/registro",
                                "/auth/login",
                                "/api/auth/register",
                                "/api/auth/registro",
                                "/api/auth/login"
                        ).permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/psicologos/*/agenda/slots-publicos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/psicologos/*/agenda/slots/disponiveis").permitAll()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/paciente/**",
                                "/psicologo/**",
                                "/admin/**",
                                "/forbidden"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/pacientes/me/**").hasRole("PACIENTE")
                        .requestMatchers("/api/psicologos/me/**").hasRole("PSICOLOGO")
                        .requestMatchers(HttpMethod.GET, "/api/psicologos/disponiveis").hasRole("PACIENTE")
                        .requestMatchers("/api/consultas/**").hasAnyRole("PACIENTE", "PSICOLOGO")
                        .requestMatchers("/api/**").authenticated()
                        // Qualquer rota nao listada acima continua protegida, evitando que
                        // endpoints nao mapeados (actuator, swagger, etc.) fiquem publicos.
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
