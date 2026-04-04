package com.smartcampus.backend.services;

import com.smartcampus.backend.dto.TicketCommentRequest;
import com.smartcampus.backend.entity.TicketComment;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.repository.TicketCommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final IncidentTicketService ticketService; // To ensure ticket exists

    public TicketCommentService(TicketCommentRepository commentRepository, IncidentTicketService ticketService) {
        this.commentRepository = commentRepository;
        this.ticketService = ticketService;
    }

    public TicketComment addComment(String ticketId, TicketCommentRequest request) {
        // Verify ticket exists
        ticketService.getTicketById(ticketId);

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setAuthorId(request.getAuthorId());
        comment.setAuthorRole(request.getAuthorRole());
        comment.setContent(request.getContent());

        return commentRepository.save(comment);
    }

    public List<TicketComment> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    public TicketComment updateComment(String commentId, String authorId, String newContent) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        
        // Ownership check
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
        boolean staff = "ADMIN".equalsIgnoreCase(userRole) || "TECHNICIAN".equalsIgnoreCase(userRole);
        if (!owner && !staff) {
            throw new IllegalArgumentException("User is not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
