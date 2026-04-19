package com.smartcampus.backend.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String resourceId;
    private String requesterEmail;
    private String requesterName;

    private Instant startDateTime;
    private Instant endDateTime;

    private String purpose;
    private Integer expectedAttendees;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private String adminDecisionReason;

    private Instant createdAt;
    private Instant updatedAt;
}
