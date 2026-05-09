package psihub.dtos.agenda;

import jakarta.validation.constraints.Size;

public record BloquearSlotRequest(
        @Size(max = 300) String motivo
) {
}
