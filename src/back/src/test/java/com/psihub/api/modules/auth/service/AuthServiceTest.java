package com.psihub.api.modules.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.psihub.api.modules.auth.dto.LoginRequest;
import com.psihub.api.modules.auth.dto.AuthResponse;
import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.auth.repository.UsuarioRepository;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.shared.enums.StatusAcesso;
import com.psihub.api.shared.enums.TipoUsuario;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PacienteService pacienteService;

    @Mock
    private PsicologoService psicologoService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Test
    void devePermitirLoginDePsicologoPendente() {
        Usuario usuario = new Usuario();
        usuario.setId(7L);
        usuario.setNome("Psi Teste");
        usuario.setEmail("psi@psihub.com");
        usuario.setSenhaHash("hash");
        usuario.setTipoUsuario(TipoUsuario.PSICOLOGO);
        usuario.setAtivo(true);

        when(usuarioRepository.findByEmail("psi@psihub.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senha123", "hash")).thenReturn(true);
        when(psicologoService.buscarStatusAcessoPorId(7L)).thenReturn(StatusAcesso.PENDENTE);
        when(psicologoService.buscarCrpPorId(7L)).thenReturn("CRP 06/000000");
        when(jwtService.generateToken(usuario)).thenReturn("jwt-token");

        AuthService service = new AuthService(
                usuarioRepository,
                pacienteService,
                psicologoService,
                passwordEncoder,
                jwtService,
                7
        );

        AuthResponse response = service.login(new LoginRequest("psi@psihub.com", "senha123"));

        assertEquals("jwt-token", response.token());
        assertEquals("psicologo", response.user().tipo());
    }
}
