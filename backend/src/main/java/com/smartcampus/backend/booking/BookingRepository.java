package com.smartcampus.backend.booking;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByRequesterEmailOrderByStartDateTimeDesc(String requesterEmail);
}
