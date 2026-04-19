package com.smartcampus.backend.booking;

import com.smartcampus.backend.booking.dto.AdminDecisionRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<Booking>> list(
        @RequestParam(required = false) BookingStatus status,
        @RequestParam(required = false) String resourceId,
        @RequestParam(required = false) Instant from,
        @RequestParam(required = false) Instant to
    ) {
        return ResponseEntity.ok(bookingService.listForAdmin(status, resourceId, from, to));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Booking> approve(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Booking> reject(
        @PathVariable String id,
        @Valid @RequestBody(required = false) AdminDecisionRequest body
    ) {
        AdminDecisionRequest.requireReasonForReject(body);
        return ResponseEntity.ok(bookingService.reject(id, body.reason().trim()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancel(
        @PathVariable String id,
        @Valid @RequestBody(required = false) AdminDecisionRequest body
    ) {
        String reason = body != null && body.reason() != null ? body.reason() : null;
        return ResponseEntity.ok(bookingService.cancelAsAdmin(id, reason));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        bookingService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
