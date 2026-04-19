package com.smartcampus.backend.notification;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.security.AppPrincipal;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<Notification> list(@AuthenticationPrincipal AppPrincipal principal) {
        return notificationService.getNotificationsForUser(principal.getEmail());
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public Notification markAsRead(
        @PathVariable String id,
        @AuthenticationPrincipal AppPrincipal principal
    ) {
        return notificationService.markAsRead(id, principal.getEmail());
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<MarkAllResponse> readAll(@AuthenticationPrincipal AppPrincipal principal) {
        int count = notificationService.markAllAsRead(principal.getEmail());
        return ResponseEntity.ok(new MarkAllResponse(count));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> createAdminNotification(@Valid @RequestBody CreateNotificationRequest request) {
        if (request.recipientEmails() == null || request.recipientEmails().isEmpty()) {
            notificationService.create("", request.title(), request.message(), request.category());
        } else {
            for (String email : request.recipientEmails()) {
                notificationService.create(email, request.title(), request.message(), request.category());
            }
        }
        return ResponseEntity.ok().build();
    }

    public record CreateNotificationRequest(
        List<String> recipientEmails,
        @NotBlank String title,
        @NotBlank String message,
        @NotBlank String category
    ) {
    }

    public record MarkAllResponse(int updatedCount) {
    }
}
