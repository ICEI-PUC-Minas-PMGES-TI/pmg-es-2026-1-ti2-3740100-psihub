package com.psihub.api.modules.psicologos.controller;

import com.psihub.api.modules.psicologos.dto.PsicologoDisponivelResponse;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

