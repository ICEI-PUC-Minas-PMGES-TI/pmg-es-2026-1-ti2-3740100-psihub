package com.psihub.api.modules.auth.service;

import com.psihub.api.modules.auth.dto.AuthResponse;
import com.psihub.api.modules.auth.dto.AuthUserResponse;
import com.psihub.api.modules.auth.dto.LoginRequest;
import com.psihub.api.modules.auth.dto.RegisterRequest;
import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.auth.repository.UsuarioRepository;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.shared.enums.StatusAcesso;
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
        validarCadastro(request, tipoUsuario);

        if (usuarioRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ja existe uma conta cadastrada com este e-mail");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setTelefone(sanitizeOptional(request.telefone()));
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setTipoUsuario(tipoUsuario);
        usuario.setAtivo(true);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        criarPerfilInicial(usuarioSalvo, request);

        if (tipoUsuario == TipoUsuario.PSICOLOGO) {
            return new AuthResponse(null, toUserResponse(usuarioSalvo), 0);
        }
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

        validarAcessoLogin(usuario);
        return toAuthResponse(usuario);
    }

    private void criarPerfilInicial(Usuario usuario, RegisterRequest request) {
        if (usuario.getTipoUsuario() == TipoUsuario.PACIENTE) {
            pacienteService.criarPerfilInicial(usuario, request.dataNascimento());
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
        String cargo = switch (usuario.getTipoUsuario()) {
            case PSICOLOGO -> "Psicologo";
            case ADMIN -> "Administrador";
            case PACIENTE -> "Paciente";
        };

        return new AuthUserResponse(
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoUsuario().name().toLowerCase(Locale.ROOT),
                cargo,
                crp
        );
    }

    public Usuario buscarUsuarioPorId(Long id) {
        return usuarioRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario responsavel pelo agendamento nao encontrado"));
    }

    private void validarCadastro(RegisterRequest request, TipoUsuario tipoUsuario) {
        if (!Objects.equals(request.senha(), request.confirmarSenha())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Confirmacao de senha nao confere");
        }

        if (tipoUsuario == TipoUsuario.PACIENTE && request.dataNascimento() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Data de nascimento e obrigatoria para paciente");
        }
    }

    private void validarAcessoLogin(Usuario usuario) {
        if (usuario.getTipoUsuario() != TipoUsuario.PSICOLOGO) {
            return;
        }

        StatusAcesso status = psicologoService.buscarStatusAcessoPorId(usuario.getId());
        if (status == StatusAcesso.PENDENTE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cadastro de psicologo pendente de aprovacao administrativa");
        }
        if (status == StatusAcesso.REVOGADO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso do psicologo revogado pelo administrador");
        }
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

    private String sanitizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        return normalized.isBlank() ? null : normalized;
    }

    private TipoUsuario parseTipo(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (!normalized.equals("PACIENTE") && !normalized.equals("PSICOLOGO")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tipo de usuario invalido");
        }
        return TipoUsuario.valueOf(normalized);
    }
}
