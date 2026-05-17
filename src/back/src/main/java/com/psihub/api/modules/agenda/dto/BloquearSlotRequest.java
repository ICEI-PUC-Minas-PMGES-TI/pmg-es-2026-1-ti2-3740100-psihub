package com.psihub.api.modules.agenda.dto;

import jakarta.validation.constraints.Size;

public record BloquearSlotRequest(
        @Size(max = 300) String motivo
) {
}

