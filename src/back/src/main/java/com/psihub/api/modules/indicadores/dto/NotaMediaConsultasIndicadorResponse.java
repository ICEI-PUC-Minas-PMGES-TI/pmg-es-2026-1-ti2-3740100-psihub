package com.psihub.api.modules.indicadores.dto;

public record NotaMediaConsultasIndicadorResponse(
        double notaMedia,
        long totalAvaliacoes
) {}
