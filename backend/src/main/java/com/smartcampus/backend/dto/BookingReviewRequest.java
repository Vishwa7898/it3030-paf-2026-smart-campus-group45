package com.smartcampus.backend.dto;

import com.smartcampus.backend.booking.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookingReviewRequest(
        @NotNull BookingStatus status,
        @Size(max = 1000) String reason
) {
}
