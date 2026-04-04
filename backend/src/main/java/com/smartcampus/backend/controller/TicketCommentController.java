package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.TicketCommentRequest;
import com.smartcampus.backend.entity.TicketComment;
import com.smartcampus.backend.services.TicketCommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class TicketCommentController {

    private final TicketCommentService commentService;

    public TicketCommentController(TicketCommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<TicketComment> addComment(
            @PathVariable String ticketId,
            @RequestBody TicketCommentRequest request) {
        TicketComment comment = commentService.addComment(ticketId, request);
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable String ticketId) {
        List<TicketComment> comments = commentService.getCommentsByTicketId(ticketId);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<TicketComment> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody TicketCommentRequest request) {
        // authorId is simulated to be passed in request body for validation
        TicketComment comment = commentService.updateComment(commentId, request.getAuthorId(), request.getContent());
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestParam String userId,
            @RequestParam String userRole) {
        // In reality, userId and userRole would come from Authentication principal
        commentService.deleteComment(commentId, userId, userRole);
        return ResponseEntity.noContent().build();
    }
}
