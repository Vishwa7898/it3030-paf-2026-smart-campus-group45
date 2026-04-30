package com.smartcampus.backend.booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Facility / asset booking (Module B – Booking Management).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    private String resourceId;

    private String requesterUserId;

    private String requesterEmail;

    private String requesterName;

    private Instant startDateTime;

    private Instant endDateTime;

    private String purpose;

    private Integer expectedAttendees;

    private BookingStatus status = BookingStatus.PENDING;

    /** Admin rejection reason or optional review notes. */
    private String reviewReason;

    private Instant createdAt;
    private Instant updatedAt;
}
