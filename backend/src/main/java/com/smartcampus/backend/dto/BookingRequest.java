package com.smartcampus.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private String studentId;
    private String roomId;
    private String purpose;
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
}
