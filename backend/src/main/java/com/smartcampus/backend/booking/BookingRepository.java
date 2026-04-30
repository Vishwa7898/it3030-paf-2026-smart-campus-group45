package com.smartcampus.backend.booking;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.Instant;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByRequesterUserIdOrderByStartDateTimeDesc(String requesterUserId);

    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("{ 'resourceId': ?0, 'status': { $in: ?1 }, 'startDateTime': { $lt: ?3 }, 'endDateTime': { $gt: ?2 } }")
    List<Booking> findOverlapping(
            String resourceId,
            List<BookingStatus> statuses,
            Instant rangeStart,
            Instant rangeEnd
    );
}
