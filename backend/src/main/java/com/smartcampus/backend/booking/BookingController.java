package com.smartcampus.backend.booking;

import com.smartcampus.backend.dto.BookingCreateRequest;
import com.smartcampus.backend.dto.BookingReviewRequest;
import com.smartcampus.backend.dto.BookingUpdateRequest;
import com.smartcampus.backend.security.AppPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Module B – Booking management REST API.
 *
 * <p>GET /api/bookings/my — list current user's bookings</p>
 * <p>GET /api/bookings — list all (admin, optional filters)</p>
 * <p>GET /api/bookings/{id} — booking detail</p>
 * <p>POST /api/bookings — submit request</p>
 * <p>PUT /api/bookings/{id} — edit own pending booking</p>
 * <p>PATCH /api/bookings/{id}/review — approve / reject (admin)</p>
 * <p>DELETE /api/bookings/{id} — cancel (owner or admin)</p>
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> create(
            @AuthenticationPrincipal AppPrincipal principal,
            @Valid @RequestBody BookingCreateRequest request) {
        return new ResponseEntity<>(bookingService.create(principal, request), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> myBookings(@AuthenticationPrincipal AppPrincipal principal) {
        return ResponseEntity.ok(bookingService.listMine(principal));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> listAll(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String resourceId) {
        return ResponseEntity.ok(bookingService.listAll(status, resourceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getOne(
            @PathVariable String id,
            @AuthenticationPrincipal AppPrincipal principal) {
        return ResponseEntity.ok(bookingService.getById(id, principal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> update(
            @PathVariable String id,
            @AuthenticationPrincipal AppPrincipal principal,
            @Valid @RequestBody BookingUpdateRequest request) {
        return ResponseEntity.ok(bookingService.update(id, principal, request));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> review(
            @PathVariable String id,
            @AuthenticationPrincipal AppPrincipal principal,
            @Valid @RequestBody BookingReviewRequest request) {
        return ResponseEntity.ok(bookingService.review(id, principal, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable String id,
            @AuthenticationPrincipal AppPrincipal principal) {
        bookingService.cancel(id, principal);
        return ResponseEntity.noContent().build();
    }
}
