package com.psihub.api.modules.agenda.dto;

import java.time.LocalDateTime;

/**
 * Represents an available time slot for scheduling a consultation.
 * This is generated dynamically based on availability rules, exceptions, and existing bookings.
 */
public record HorarioDisponivelDTO(
        LocalDateTime inicio,
        LocalDateTime fim
) {
}
