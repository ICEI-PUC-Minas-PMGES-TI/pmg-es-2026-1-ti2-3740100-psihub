package psihub.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import psihub.domain.enums.StatusAcesso;
import psihub.domain.enums.TipoUsuario;
import psihub.domain.model.EspecialidadePsicologo;
import psihub.domain.model.Paciente;
import psihub.domain.model.Psicologo;
import psihub.domain.model.Usuario;
import psihub.dtos.auth.AuthResponse;
import psihub.dtos.auth.AuthUserResponse;
import psihub.dtos.auth.LoginRequest;
import psihub.dtos.auth.RegisterRequest;
import psihub.exceptions.ApiException;
import psihub.repositories.EspecialidadePsicologoRepository;
import psihub.repositories.PacienteRepository;
import psihub.repositories.PsicologoRepository;
import psihub.repositories.UsuarioRepository;
import psihub.security.JwtService;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final PsicologoRepository psicologoRepository;
    private final EspecialidadePsicologoRepository especialidadePsicologoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final int jwtExpirationDays;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PacienteRepository pacienteRepository,
            PsicologoRepository psicologoRepository,
            EspecialidadePsicologoRepository especialidadePsicologoRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${app.security.jwt-expiration-days}") int jwtExpirationDays
    ) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.psicologoRepository = psicologoRepository;
        this.especialidadePsicologoRepository = especialidadePsicologoRepository;
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
            Paciente paciente = new Paciente();
            paciente.setUsuario(usuario);
            paciente.setDataNascimento(LocalDate.of(1900, 1, 1));
            pacienteRepository.save(paciente);
            return;
        }

        Psicologo psicologo = new Psicologo();
        psicologo.setUsuario(usuario);
        psicologo.setCrp("CADASTRO-" + usuario.getId());
        psicologo.setValorConsulta(BigDecimal.ZERO);
        psicologo.setBiografia("Perfil profissional em configuracao.");
        psicologo.setStatusAcesso(StatusAcesso.ATIVO);
        Psicologo psicologoSalvo = psicologoRepository.save(psicologo);

        EspecialidadePsicologo especialidade = new EspecialidadePsicologo();
        especialidade.setPsicologo(psicologoSalvo);
        especialidade.setNome("Psicologia");
        especialidadePsicologoRepository.save(especialidade);
    }

    private AuthResponse toAuthResponse(Usuario usuario) {
        return new AuthResponse(jwtService.generateToken(usuario), toUserResponse(usuario), jwtExpirationDays);
    }

    private AuthUserResponse toUserResponse(Usuario usuario) {
        boolean isPsychologist = usuario.getTipoUsuario() == TipoUsuario.PSICOLOGO;
        String crp = isPsychologist
                ? psicologoRepository.findById(usuario.getId()).map(Psicologo::getCrp).orElse(null)
                : null;

        return new AuthUserResponse(
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoUsuario().name().toLowerCase(Locale.ROOT),
                isPsychologist ? "Psicólogo" : "Paciente",
                crp
        );
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
