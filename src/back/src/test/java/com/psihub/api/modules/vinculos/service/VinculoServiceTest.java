package com.psihub.api.modules.vinculos.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.modules.vinculos.entity.StatusVinculo;
import com.psihub.api.modules.vinculos.repository.VinculoPsicologoPacienteRepository;
import com.psihub.api.shared.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.HttpStatus;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VinculoServiceTest {

    @Mock
    private VinculoPsicologoPacienteRepository vinculoRepository;

    @Mock
    private PacienteService pacienteService;

    @Mock
    private PsicologoService psicologoService;

    @Test
    void deveNegarAcessoClinicoSemVinculoAceito() {
        when(vinculoRepository.existsByPacienteIdAndPsicologoIdAndStatus(1L, 2L, StatusVinculo.ACEITO))
                .thenReturn(false);

        VinculoService service = new VinculoService(vinculoRepository, pacienteService, psicologoService);

        ApiException exception = assertThrows(ApiException.class, () ->
                service.exigirVinculoAceito(1L, 2L));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }
}
