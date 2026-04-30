package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TicketCommentRequest {

    @NotBlank
    @Size(max = 2000)
    private String content;

    @NotBlank
    private String authorId;

    @NotBlank
    private String authorRole;
}
