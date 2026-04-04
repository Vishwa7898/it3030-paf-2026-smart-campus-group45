package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.BookingRequest;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.Room;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public Booking createBooking(BookingRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.getCurrentOccupancy() >= room.getCapacity()) {
            throw new RuntimeException("Room is fully occupied");
        }

        Booking booking = Booking.builder()
                .studentId(request.getStudentId())
                .roomId(request.getRoomId())
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .bookingDate(LocalDateTime.now())
                .status("CONFIRMED")
                .paymentStatus("PENDING")
                .build();

        // Update room occupancy
        room.setCurrentOccupancy(room.getCurrentOccupancy() + 1);
        roomRepository.save(room);

        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByStudentId(String studentId) {
        return bookingRepository.findByStudentId(studentId);
    }
}
