package com.smartcampus.backend.booking;

import com.smartcampus.backend.booking.dto.CreateBookingRequest;
import com.smartcampus.backend.exception.BookingConflictException;
import com.smartcampus.backend.exception.BookingNotFoundException;
import com.smartcampus.backend.security.AppPrincipal;
import com.smartcampus.backend.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final MongoTemplate mongoTemplate;
    private final ResourceService resourceService;

    public Booking createBooking(AppPrincipal principal, CreateBookingRequest req) {
        resourceService.getResourceById(req.resourceId());

        Instant start = req.startDateTime();
        Instant end = req.endDateTime();
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (hasSchedulingConflict(req.resourceId(), start, end, null)) {
            throw new BookingConflictException("This resource is already booked for an overlapping time range");
        }

        Instant now = Instant.now();
        Booking booking = Booking.builder()
            .resourceId(req.resourceId())
            .requesterEmail(principal.getEmail())
            .requesterName(principal.getDisplayName())
            .startDateTime(start)
            .endDateTime(end)
            .purpose(req.purpose().trim())
            .expectedAttendees(req.expectedAttendees())
            .status(BookingStatus.PENDING)
            .createdAt(now)
            .updatedAt(now)
            .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> listMine(String email) {
        return bookingRepository.findByRequesterEmailOrderByStartDateTimeDesc(email);
    }

    public List<Booking> listForAdmin(
        BookingStatus status,
        String resourceId,
        Instant rangeFrom,
        Instant rangeTo
    ) {
        Query query = new Query();
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (resourceId != null && !resourceId.isBlank()) {
            query.addCriteria(Criteria.where("resourceId").is(resourceId.trim()));
        }
        if (rangeFrom != null) {
            query.addCriteria(Criteria.where("endDateTime").gt(rangeFrom));
        }
        if (rangeTo != null) {
            query.addCriteria(Criteria.where("startDateTime").lt(rangeTo));
        }
        query.with(Sort.by(Sort.Direction.DESC, "startDateTime"));
        return mongoTemplate.find(query, Booking.class);
    }

    public Booking approve(String bookingId) {
        Booking booking = getById(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }
        if (hasSchedulingConflict(
            booking.getResourceId(),
            booking.getStartDateTime(),
            booking.getEndDateTime(),
            booking.getId()
        )) {
            throw new BookingConflictException("Another booking already holds this time slot for the resource");
        }
        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminDecisionReason(null);
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public Booking reject(String bookingId, String reason) {
        Booking booking = getById(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminDecisionReason(reason != null ? reason.trim() : null);
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public Booking cancelAsAdmin(String bookingId, String reason) {
        Booking booking = getById(bookingId);
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setAdminDecisionReason(reason != null && !reason.isBlank() ? reason.trim() : null);
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public void deleteById(String id) {
        if (!bookingRepository.existsById(id)) {
            throw new BookingNotFoundException("Booking not found: " + id);
        }
        bookingRepository.deleteById(id);
    }

    private Booking getById(String id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + id));
    }

    public boolean hasSchedulingConflict(String resourceId, Instant start, Instant end, String excludeBookingId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("resourceId").is(resourceId));
        query.addCriteria(Criteria.where("status").in(BookingStatus.PENDING, BookingStatus.APPROVED));
        query.addCriteria(Criteria.where("startDateTime").lt(end));
        query.addCriteria(Criteria.where("endDateTime").gt(start));
        if (excludeBookingId != null && !excludeBookingId.isBlank()) {
            query.addCriteria(Criteria.where("id").ne(excludeBookingId));
        }
        return mongoTemplate.exists(query, Booking.class);
    }
}
