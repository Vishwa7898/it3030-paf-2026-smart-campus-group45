package com.smartcampus.backend.booking.dto;

import jakarta.validation.constraints.Size;

public record AdminDecisionRequest(@Size(max = 2000) String reason) {

    public static void requireReasonForReject(AdminDecisionRequest req) {
        if (req == null || req.reason() == null || req.reason().isBlank()) {
            throw new IllegalArgumentException("A reason is required when rejecting a booking");
        }
    }
}
