package com.smartcampus.backend.dto;

import com.smartcampus.backend.entity.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusUpdateRequest {

    @NotNull
    private TicketStatus status;

    private String resolutionNotes;

    /** When status is REJECTED, use this as the rejection reason (alternative to resolutionNotes). */
    private String reason;

    @NotBlank
    private String actorId;

    @NotBlank
    private String actorRole;
}
