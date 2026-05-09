package psihub.controllers;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import psihub.dtos.psicologos.PsicologoDisponivelResponse;
import psihub.services.PsicologoService;

@RestController
@RequestMapping("/api/psicologos")
public class PsicologoController {

    private final PsicologoService psicologoService;

    public PsicologoController(PsicologoService psicologoService) {
        this.psicologoService = psicologoService;
    }

    @GetMapping("/disponiveis")
    public List<PsicologoDisponivelResponse> listarDisponiveis() {
        return psicologoService.listarDisponiveis();
    }
}
