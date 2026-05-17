package com.psihub.api.modules.registros.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.registros.dto.RegistroEmocionalRequest;
import com.psihub.api.modules.registros.entity.RegistroEmocional;
import com.psihub.api.modules.registros.repository.RegistroEmocionalRepository;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.utils.ApiResponseMapper;
import com.psihub.api.shared.utils.JsonListMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RegistroEmocionalServiceTest {

    @Mock
    private RegistroEmocionalRepository registroRepository;

    @Mock
    private PacienteService pacienteService;

    @Mock
    private JsonListMapper jsonListMapper;

    @Mock
    private ApiResponseMapper mapper;

    @Test
    void deveBloquearEdicaoApos24Horas() {
        Paciente paciente = new Paciente();
        ReflectionTestUtils.setField(paciente, "id", 10L);

        RegistroEmocional registro = new RegistroEmocional();
        registro.setPaciente(paciente);
        registro.setEditavelAte(LocalDateTime.now().minusMinutes(1));

        when(registroRepository.findById(99L)).thenReturn(Optional.of(registro));

        RegistroEmocionalService service = new RegistroEmocionalService(
                registroRepository,
                pacienteService,
                jsonListMapper,
                mapper
        );

        ApiException exception = assertThrows(ApiException.class, () ->
                service.atualizarComoPaciente(
                        10L,
                        99L,
                        new RegistroEmocionalRequest(4, "Dia estavel", List.of("calma"))
                ));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }
}
