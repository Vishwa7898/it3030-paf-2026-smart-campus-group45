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

        List<Booking> overlaps = bookingRepository.findOverlappingBookings(
            request.getRoomId(), request.getCheckInDate(), request.getCheckOutDate()
        );

        if (overlaps.size() >= room.getCapacity()) {
            throw new RuntimeException("Resource overlapping detected. Fully booked for this period.");
        }

        Booking booking = Booking.builder()
                .studentId(request.getStudentId())
                .roomId(request.getRoomId())
                .purpose(request.getPurpose())
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .bookingDate(LocalDateTime.now())
                .status("PENDING")
                .paymentStatus("PENDING")
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByStudentId(String studentId) {
        return bookingRepository.findByStudentId(studentId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking approveBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus("APPROVED");
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(String bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus("REJECTED");
        booking.setReason(reason);
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }
}
