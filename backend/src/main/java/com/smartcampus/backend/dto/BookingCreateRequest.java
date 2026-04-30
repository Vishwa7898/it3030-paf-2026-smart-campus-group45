package com.smartcampus.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record BookingCreateRequest(
        @NotBlank String resourceId,
        @NotNull Instant startDateTime,
        @NotNull Instant endDateTime,
        @NotBlank @Size(max = 500) String purpose,
        @NotNull @Min(1) @Max(10000) Integer expectedAttendees
) {
}
