package com.smartcampus.backend.booking;

import com.smartcampus.backend.dto.BookingCreateRequest;
import com.smartcampus.backend.dto.BookingReviewRequest;
import com.smartcampus.backend.dto.BookingUpdateRequest;
import com.smartcampus.backend.exception.BookingConflictException;
import com.smartcampus.backend.exception.ForbiddenException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.notification.NotificationService;
import com.smartcampus.backend.security.AppPrincipal;
import com.smartcampus.backend.service.ResourceService;
import com.smartcampus.backend.user.AppUser;
import com.smartcampus.backend.user.AppUserRepository;
import com.smartcampus.backend.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final List<BookingStatus> OVERLAP_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
    private static final int LOCK_STRIPES = 64;

    /** Striped locks so two concurrent creates for the same resource cannot both pass overlap checks. */
    private static final Object[] RESOURCE_STRIPES = buildStripes();

    private static Object[] buildStripes() {
        Object[] stripes = new Object[LOCK_STRIPES];
        for (int i = 0; i < LOCK_STRIPES; i++) {
            stripes[i] = new Object();
        }
        return stripes;
    }

    private static Object lockStripeFor(String resourceId) {
        return RESOURCE_STRIPES[Math.floorMod(resourceId.hashCode(), LOCK_STRIPES)];
    }

    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    public Booking create(AppPrincipal principal, BookingCreateRequest request) {
        synchronized (lockStripeFor(request.resourceId())) {
            AppUser user = resolveUser(principal);
            Resource resource = resourceService.getResourceById(request.resourceId());
            if (resource.getStatus() != ResourceStatus.ACTIVE) {
                throw new IllegalArgumentException("This resource is not available for booking");
            }
            Instant now = Instant.now();
            validateWindow(request.startDateTime(), request.endDateTime());
            validateNotInPast(request.startDateTime(), request.endDateTime(), now);
            validateAttendees(resource, request.expectedAttendees());
            assertNoOverlap(request.resourceId(), request.startDateTime(), request.endDateTime(), null);

            Booking booking = new Booking();
            booking.setResourceId(request.resourceId());
            booking.setRequesterUserId(user.getId());
            booking.setRequesterEmail(user.getEmail());
            booking.setRequesterName(user.getName());
            booking.setStartDateTime(request.startDateTime());
            booking.setEndDateTime(request.endDateTime());
            booking.setPurpose(request.purpose().trim());
            booking.setExpectedAttendees(request.expectedAttendees());
            booking.setStatus(BookingStatus.PENDING);
            booking.setCreatedAt(now);
            booking.setUpdatedAt(now);
            return bookingRepository.save(booking);
        }
    }

    public List<Booking> listMine(AppPrincipal principal) {
        AppUser user = resolveUser(principal);
        return bookingRepository.findByRequesterUserIdOrderByStartDateTimeDesc(user.getId());
    }

    public List<Booking> listAll(BookingStatus status, String resourceId) {
        List<Booking> all = bookingRepository.findAllByOrderByCreatedAtDesc();
        Stream<Booking> stream = all.stream();
        if (status != null) {
            stream = stream.filter(b -> b.getStatus() == status);
        }
        if (resourceId != null && !resourceId.isBlank()) {
            stream = stream.filter(b -> resourceId.equals(b.getResourceId()));
        }
        return stream.toList();
    }

    public Booking getById(String id, AppPrincipal principal) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        assertCanView(booking, principal);
        return booking;
    }

    public Booking update(String id, AppPrincipal principal, BookingUpdateRequest request) {
        Booking existing = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        synchronized (lockStripeFor(existing.getResourceId())) {
            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            AppUser user = resolveUser(principal);
            if (!booking.getRequesterUserId().equals(user.getId())) {
                throw new ForbiddenException("You can only edit your own bookings");
            }
            if (booking.getStatus() != BookingStatus.PENDING) {
                throw new IllegalArgumentException("Only pending bookings can be edited");
            }
            Resource resource = resourceService.getResourceById(booking.getResourceId());
            Instant now = Instant.now();
            validateWindow(request.startDateTime(), request.endDateTime());
            validateNotInPast(request.startDateTime(), request.endDateTime(), now);
            validateAttendees(resource, request.expectedAttendees());
            assertNoOverlap(booking.getResourceId(), request.startDateTime(), request.endDateTime(), id);

            booking.setStartDateTime(request.startDateTime());
            booking.setEndDateTime(request.endDateTime());
            booking.setPurpose(request.purpose().trim());
            booking.setExpectedAttendees(request.expectedAttendees());
            booking.setUpdatedAt(now);
            return bookingRepository.save(booking);
        }
    }

    public Booking review(String id, AppPrincipal principal, BookingReviewRequest body) {
        if (!EnumSet.of(BookingStatus.APPROVED, BookingStatus.REJECTED).contains(body.status())) {
            throw new IllegalArgumentException("Review status must be APPROVED or REJECTED");
        }
        if (body.status() == BookingStatus.REJECTED
                && (body.reason() == null || body.reason().isBlank())) {
            throw new IllegalArgumentException("A reason is required when rejecting a booking");
        }
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be reviewed");
        }
        assertAdmin(principal);

        synchronized (lockStripeFor(booking.getResourceId())) {
            booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            if (booking.getStatus() != BookingStatus.PENDING) {
                throw new IllegalArgumentException("Only pending bookings can be reviewed");
            }
            if (body.status() == BookingStatus.APPROVED) {
                assertNoOverlap(
                        booking.getResourceId(),
                        booking.getStartDateTime(),
                        booking.getEndDateTime(),
                        booking.getId()
                );
            }

            booking.setStatus(body.status());
            booking.setReviewReason(body.reason() != null ? body.reason().trim() : null);
            booking.setUpdatedAt(Instant.now());
            booking = bookingRepository.save(booking);
        }

        Resource resource = resourceService.getResourceById(booking.getResourceId());
        String resourceLabel = resource.getName() != null ? resource.getName() : booking.getResourceId();
        if (body.status() == BookingStatus.APPROVED) {
            notificationService.create(
                    booking.getRequesterEmail(),
                    "Booking approved",
                    "Your booking for \"" + resourceLabel + "\" has been approved.",
                    "BOOKING"
            );
        } else {
            notificationService.create(
                    booking.getRequesterEmail(),
                    "Booking rejected",
                    "Your booking for \"" + resourceLabel + "\" was rejected. Reason: "
                            + (body.reason() != null ? body.reason() : ""),
                    "BOOKING"
            );
        }
        return booking;
    }

    public void cancel(String id, AppPrincipal principal) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        AppUser user = resolveUser(principal);
        boolean admin = isAdmin(principal);
        if (!admin && !booking.getRequesterUserId().equals(user.getId())) {
            throw new ForbiddenException("You can only cancel your own bookings");
        }
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only pending or approved bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(Instant.now());
        bookingRepository.save(booking);
    }

    private AppUser resolveUser(AppPrincipal principal) {
        return appUserRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));
    }

    private void assertCanView(Booking booking, AppPrincipal principal) {
        AppUser user = resolveUser(principal);
        if (booking.getRequesterUserId().equals(user.getId())) {
            return;
        }
        if (isAdmin(principal)) {
            return;
        }
        throw new ForbiddenException("You cannot view this booking");
    }

    private boolean isAdmin(AppPrincipal principal) {
        return principal.getRoles() != null && principal.getRoles().contains(Role.ADMIN);
    }

    private void assertAdmin(AppPrincipal principal) {
        if (!isAdmin(principal)) {
            throw new ForbiddenException("Admin access required");
        }
    }

    private void validateWindow(Instant start, Instant end) {
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    /** Bookings cannot start or end in the past (server clock). */
    private void validateNotInPast(Instant start, Instant end, Instant now) {
        if (start.isBefore(now)) {
            throw new IllegalArgumentException("Booking start time cannot be in the past");
        }
        if (!end.isAfter(now)) {
            throw new IllegalArgumentException("Booking end time must be in the future");
        }
    }

    private void validateAttendees(Resource resource, int attendees) {
        if (resource.getCapacity() != null && attendees > resource.getCapacity()) {
            throw new IllegalArgumentException(
                    "Expected attendees cannot exceed resource capacity (" + resource.getCapacity() + ")"
            );
        }
    }

    private void assertNoOverlap(String resourceId, Instant start, Instant end, String excludeBookingId) {
        List<Booking> overlaps = bookingRepository.findOverlapping(resourceId, OVERLAP_STATUSES, start, end);
        boolean conflict = overlaps.stream()
                .anyMatch(b -> excludeBookingId == null || !excludeBookingId.equals(b.getId()));
        if (conflict) {
            throw new BookingConflictException("This time range overlaps an existing booking for this resource");
        }
    }
}
