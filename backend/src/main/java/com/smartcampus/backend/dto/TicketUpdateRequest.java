package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TicketUpdateRequest {

    @Size(max = 2000)
    private String description;

    @Size(max = 500)
    private String contactDetails;

    @Size(max = 200)
    private String category;

    @NotBlank
    private String actorId;

    @NotBlank
    private String actorRole;
}
