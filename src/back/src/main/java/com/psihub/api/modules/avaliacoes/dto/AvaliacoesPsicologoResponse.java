package com.psihub.api.modules.avaliacoes.dto;

import java.util.List;

public record AvaliacoesPsicologoResponse(
        MediaAvaliacaoResponse media,
        List<AvaliacaoResponse> avaliacoes
) {}
