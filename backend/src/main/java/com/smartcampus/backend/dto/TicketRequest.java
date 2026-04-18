package com.smartcampus.backend.dto;

import com.smartcampus.backend.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class TicketRequest {

    /** Optional; defaults to a placeholder when omitted. */
    @Size(max = 200)
    private String resourceId;

    /** Optional; defaults to a placeholder when omitted. */
    @Size(max = 200)
    private String location;

    @NotBlank
    @Size(max = 200)
    private String category;

    @NotBlank
    @Size(max = 2000)
    private String description;

    @NotNull
    private TicketPriority priority;

    @NotBlank
    @Size(max = 500)
    private String contactDetails;

    @NotBlank
    private String submitterId;

    private List<MultipartFile> images;
}
