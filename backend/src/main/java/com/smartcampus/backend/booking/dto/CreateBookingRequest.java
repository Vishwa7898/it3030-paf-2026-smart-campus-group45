package com.smartcampus.backend.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateBookingRequest(
    @NotBlank String resourceId,
    @NotNull Instant startDateTime,
    @NotNull Instant endDateTime,
    @NotBlank @Size(max = 2000) String purpose,
    @Positive Integer expectedAttendees
) {}
