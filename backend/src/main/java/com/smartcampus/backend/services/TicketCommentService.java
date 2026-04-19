package com.smartcampus.backend.services;

import com.smartcampus.backend.dto.TicketCommentRequest;
import com.smartcampus.backend.entity.TicketComment;
import com.smartcampus.backend.exception.ForbiddenException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.notification.NotificationService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final IncidentTicketService ticketService; // To ensure ticket exists
    private final NotificationService notificationService;

    public TicketCommentService(TicketCommentRepository commentRepository, IncidentTicketService ticketService, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.ticketService = ticketService;
        this.notificationService = notificationService;
    }

    public TicketComment addComment(String ticketId, TicketCommentRequest request) {
        var ticket = ticketService.requireTicket(ticketId);
        if ("USER".equalsIgnoreCase(request.getAuthorRole())
                && !request.getAuthorId().equals(ticket.getSubmitterId())) {
            throw new ForbiddenException("You can only comment on your own tickets");
        }

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setAuthorId(request.getAuthorId());
        comment.setAuthorRole(request.getAuthorRole());
        comment.setContent(request.getContent());

        TicketComment saved = commentRepository.save(comment);

        // Notification Logic
        String recipientId = null;
        if ("USER".equalsIgnoreCase(request.getAuthorRole())) {
            // Student commented -> notify assignee
            if (ticket.getAssigneeId() != null && !ticket.getAssigneeId().isBlank()) {
                recipientId = ticket.getAssigneeId();
            }
        } else {
            // Staff commented -> notify submitter
            recipientId = ticket.getSubmitterId();
        }

        if (recipientId != null && !recipientId.equals(request.getAuthorId())) {
            String title = "New Comment on Ticket #" + ticketId.substring(0, Math.min(8, ticketId.length()));
            String message = request.getAuthorId() + " added a comment: " +
                             (request.getContent().length() > 50 ? request.getContent().substring(0, 50) + "..." : request.getContent());
            String actionUrl = "/tickets/" + ticketId;
            notificationService.create(recipientId, title, message, "COMMENT", actionUrl);
        }

        return saved;
    }

    public List<TicketComment> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    public TicketComment updateComment(String commentId, String authorId, String newContent) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getAuthorId().equals(authorId)) {
            throw new IllegalArgumentException("User is not authorized to edit this comment");
        }

        comment.setContent(newContent);
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId, String userId, String userRole) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        boolean owner = comment.getAuthorId().equals(userId);
        String r = userRole == null ? "" : userRole.trim().toUpperCase(Locale.ROOT);
        boolean admin = "ADMIN".equals(r);
        if (!owner && !admin) {
            throw new IllegalArgumentException("User is not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
