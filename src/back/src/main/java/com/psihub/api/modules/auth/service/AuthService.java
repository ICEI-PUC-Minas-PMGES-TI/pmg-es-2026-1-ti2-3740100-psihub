package com.psihub.api.modules.auth.service;

import com.psihub.api.modules.auth.dto.AuthResponse;
import com.psihub.api.modules.auth.dto.AuthUserResponse;
import com.psihub.api.modules.auth.dto.LoginRequest;
import com.psihub.api.modules.auth.dto.RegisterRequest;
import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.auth.repository.UsuarioRepository;
import com.psihub.api.modules.auth.service.JwtService;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.shared.enums.TipoUsuario;
import com.psihub.api.shared.exception.ApiException;
import java.util.Locale;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PacienteService pacienteService;
    private final PsicologoService psicologoService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final int jwtExpirationDays;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PacienteService pacienteService,
            PsicologoService psicologoService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${app.security.jwt-expiration-days}") int jwtExpirationDays
    ) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteService = pacienteService;
        this.psicologoService = psicologoService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtExpirationDays = jwtExpirationDays;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String nome = normalizeText(request.nome());
        String email = normalizeEmail(request.email());
        TipoUsuario tipoUsuario = parseTipo(request.tipo());

        if (usuarioRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ja existe uma conta cadastrada com este e-mail");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setTipoUsuario(tipoUsuario);
        usuario.setAtivo(true);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        criarPerfilInicial(usuarioSalvo);

        return toAuthResponse(usuarioSalvo);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> invalidCredentials());

        if (!Boolean.TRUE.equals(usuario.getAtivo()) || !passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            throw invalidCredentials();
        }

        return toAuthResponse(usuario);
    }

    private void criarPerfilInicial(Usuario usuario) {
        if (usuario.getTipoUsuario() == TipoUsuario.PACIENTE) {
            pacienteService.criarPerfilInicial(usuario);
            return;
        }
        psicologoService.criarPerfilInicial(usuario);
    }

    private AuthResponse toAuthResponse(Usuario usuario) {
        return new AuthResponse(jwtService.generateToken(usuario), toUserResponse(usuario), jwtExpirationDays);
    }

    private AuthUserResponse toUserResponse(Usuario usuario) {
        boolean isPsychologist = usuario.getTipoUsuario() == TipoUsuario.PSICOLOGO;
        String crp = isPsychologist ? psicologoService.buscarCrpPorId(usuario.getId()) : null;

        return new AuthUserResponse(
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoUsuario().name().toLowerCase(Locale.ROOT),
                isPsychologist ? "Psicólogo" : "Paciente",
                crp
        );
    }

    public Usuario buscarUsuarioPorId(Long id) {
        return usuarioRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario responsavel pelo agendamento nao encontrado"));
    }

    private ApiException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "E-mail ou senha invalidos");
    }

    private String normalizeText(String value) {
        String normalized = value == null ? "" : value.trim().replaceAll("\\s+", " ");
        if (normalized.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Informe um nome valido");
        }
        return normalized;
    }

    private String normalizeEmail(String value) {
        String normalized = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        if (normalized.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Informe um e-mail valido");
        }
        return normalized;
    }

    private TipoUsuario parseTipo(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (!normalized.equals("PACIENTE") && !normalized.equals("PSICOLOGO")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tipo de usuario invalido");
        }
        return TipoUsuario.valueOf(normalized);
    }
}

