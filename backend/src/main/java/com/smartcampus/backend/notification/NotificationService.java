package com.smartcampus.backend.notification;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotificationsForUser(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    public Notification create(String email, String title, String message, String category) {
        Notification notification = new Notification();
        notification.setRecipientEmail(email);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setCategory(category);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(String id, String email) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getRecipientEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot update another user's notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public int markAllAsRead(String email) {
        List<Notification> notifications = notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
        int updatedCount = 0;
        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                notificationRepository.save(notification);
                updatedCount++;
            }
        }
        return updatedCount;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public Notification updateNotification(String id, String title, String message, String category) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setCategory(category);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(String id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
        }
        notificationRepository.deleteById(id);
    }
}
