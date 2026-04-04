package com.smartcampus.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    
    // References to other entities
    private String studentId;
    private String roomId;
    
    private String purpose;
    private String reason;
    
    private LocalDateTime bookingDate;
    
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    
    // PENDING, CONFIRMED, CANCELLED, REJECTED
    private String status;
    
    // Payment status / references
    private String paymentStatus;
}
