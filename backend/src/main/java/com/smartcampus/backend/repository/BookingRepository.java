package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByStudentId(String studentId);
    List<Booking> findByRoomId(String roomId);

    @Query("{ 'roomId': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, 'checkInDate': { $lt: ?2 }, 'checkOutDate': { $gt: ?1 } }")
    List<Booking> findOverlappingBookings(String roomId, LocalDateTime checkInDate, LocalDateTime checkOutDate);
}
