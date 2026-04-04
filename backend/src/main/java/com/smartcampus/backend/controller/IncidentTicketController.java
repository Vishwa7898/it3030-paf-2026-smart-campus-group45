package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.TicketAssignRequest;
import com.smartcampus.backend.dto.TicketRequest;
import com.smartcampus.backend.dto.TicketStatusUpdateRequest;
import com.smartcampus.backend.dto.TicketUpdateRequest;
import com.smartcampus.backend.entity.IncidentTicket;
import com.smartcampus.backend.entity.TicketPriority;
import com.smartcampus.backend.entity.TicketStatus;
import com.smartcampus.backend.services.IncidentTicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class IncidentTicketController {

    private final IncidentTicketService ticketService;

    public IncidentTicketController(IncidentTicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<IncidentTicket> createTicket(@Valid @ModelAttribute TicketRequest request) throws IOException {
        IncidentTicket createdTicket = ticketService.createTicket(request);
        return new ResponseEntity<>(createdTicket, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<IncidentTicket>> listTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) String submitterId,
            @RequestParam(required = false) String assigneeId,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String viewerId,
            @RequestParam(required = false) String viewerRole) {
        List<IncidentTicket> tickets = ticketService.findTickets(
                status, submitterId, assigneeId, priority, category, q, viewerId, viewerRole);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicket> getTicketById(
            @PathVariable String id,
            @RequestParam(required = false) String viewerId,
            @RequestParam(required = false) String viewerRole) {
        IncidentTicket ticket = ticketService.getTicketById(id, viewerId, viewerRole);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentTicket> updateTicket(
            @PathVariable String id,
            @Valid @RequestBody TicketUpdateRequest request) {
        IncidentTicket ticket = ticketService.updateTicketDetails(id, request);
        return ResponseEntity.ok(ticket);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentTicket> updateTicketStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketStatusUpdateRequest body) {
        IncidentTicket ticket = ticketService.updateTicketStatus(
                id,
                body.getStatus(),
                body.getResolutionNotes(),
                body.getActorId(),
                body.getActorRole());
        return ResponseEntity.ok(ticket);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<IncidentTicket> assignTicket(
            @PathVariable String id,
            @Valid @RequestBody TicketAssignRequest body) {
        IncidentTicket ticket = ticketService.assignTicket(id, body.getAssigneeId(), body.getActorId(), body.getActorRole());
        return ResponseEntity.ok(ticket);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable String id,
            @RequestParam String actorId,
            @RequestParam String actorRole) {
        ticketService.deleteTicket(id, actorId, actorRole);
        return ResponseEntity.noContent().build();
    }
}
