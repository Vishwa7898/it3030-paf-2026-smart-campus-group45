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

    @NotBlank
    private String actorId;

    @NotBlank
    private String actorRole;
}
