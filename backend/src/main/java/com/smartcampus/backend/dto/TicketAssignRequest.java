package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketAssignRequest {

    @NotBlank
    private String assigneeId;

    @NotBlank
    private String actorId;

    @NotBlank
    private String actorRole;
}
