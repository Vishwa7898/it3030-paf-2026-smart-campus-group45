package com.smartcampus.backend.services;

import com.smartcampus.backend.dto.TicketRequest;
import com.smartcampus.backend.dto.TicketUpdateRequest;
import com.smartcampus.backend.entity.IncidentTicket;
import com.smartcampus.backend.entity.TicketPriority;
import com.smartcampus.backend.entity.TicketStatus;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.repository.IncidentTicketRepository;
import com.smartcampus.backend.repository.TicketCommentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@Service
public class IncidentTicketService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");

    private final IncidentTicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public IncidentTicketService(IncidentTicketRepository ticketRepository,
                                 TicketCommentRepository ticketCommentRepository) {
        this.ticketRepository = ticketRepository;
        this.ticketCommentRepository = ticketCommentRepository;
    }

    public IncidentTicket createTicket(TicketRequest request) throws IOException {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setResourceId(request.getResourceId().trim());
        ticket.setLocation(request.getLocation().trim());
        ticket.setCategory(request.getCategory().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority());
        ticket.setContactDetails(request.getContactDetails().trim());
        ticket.setSubmitterId(request.getSubmitterId().trim());

        List<String> imagePaths = new ArrayList<>();
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            int limit = Math.min(request.getImages().size(), 3);
            for (int i = 0; i < limit; i++) {
                MultipartFile file = request.getImages().get(i);
                if (file != null && !file.isEmpty()) {
                    String savedFileName = saveImage(file);
                    imagePaths.add("/uploads/" + savedFileName);
                }
            }
        }
        ticket.setImagePaths(imagePaths);

        return ticketRepository.save(ticket);
    }

    private String saveImage(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Only JPEG, PNG, GIF, or WebP images are allowed");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        String uniqueFilename = java.util.UUID.randomUUID() + extension.toLowerCase(Locale.ROOT);

        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath);

        return uniqueFilename;
    }

    public List<IncidentTicket> findTickets(TicketStatus status,
                                            String submitterId,
                                            String assigneeId,
                                            TicketPriority priority,
                                            String category,
                                            String q) {
        List<IncidentTicket> list;
        if (submitterId != null && !submitterId.isBlank()) {
            list = new ArrayList<>(ticketRepository.findBySubmitterId(submitterId.trim()));
        } else if (assigneeId != null && !assigneeId.isBlank()) {
            list = new ArrayList<>(ticketRepository.findByAssigneeId(assigneeId.trim()));
        } else if (status != null) {
            list = new ArrayList<>(ticketRepository.findByStatus(status));
        } else {
            list = new ArrayList<>(ticketRepository.findAll());
        }

        if (status != null
                && (submitterId != null && !submitterId.isBlank()
                || assigneeId != null && !assigneeId.isBlank())) {
            list.removeIf(t -> !Objects.equals(t.getStatus(), status));
        }

        if (priority != null) {
            list = list.stream().filter(t -> priority.equals(t.getPriority())).toList();
        }
        if (category != null && !category.isBlank()) {
            String c = category.trim().toLowerCase(Locale.ROOT);
            list = list.stream()
                    .filter(t -> t.getCategory() != null && t.getCategory().toLowerCase(Locale.ROOT).contains(c))
                    .toList();
        }
        if (q != null && !q.isBlank()) {
            String needle = q.trim().toLowerCase(Locale.ROOT);
            list = list.stream().filter(t -> matchesSearch(t, needle)).toList();
        }

        return list;
    }

    private boolean matchesSearch(IncidentTicket t, String needle) {
        return contains(t.getDescription(), needle)
                || contains(t.getCategory(), needle)
                || contains(t.getResourceId(), needle)
                || contains(t.getLocation(), needle);
    }

    private static boolean contains(String field, String needle) {
        return field != null && field.toLowerCase(Locale.ROOT).contains(needle);
    }

    public IncidentTicket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    public IncidentTicket updateTicketStatus(String id,
                                             TicketStatus newStatus,
                                             String resolutionNotes,
                                             String actorId,
                                             String actorRole) {
        IncidentTicket ticket = getTicketById(id);
        String role = normalizeRole(actorRole);
        String aid = actorId != null ? actorId.trim() : "";

        assertCanTransition(ticket, newStatus, resolutionNotes, aid, role);

        ticket.setStatus(newStatus);
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            ticket.setResolutionNotes(resolutionNotes.trim());
        }

        return ticketRepository.save(ticket);
    }

    private void assertCanTransition(IncidentTicket ticket,
                                     TicketStatus next,
                                     String resolutionNotes,
                                     String actorId,
                                     String role) {
        TicketStatus current = ticket.getStatus();
        if (next == current) {
            return;
        }
        if (current == TicketStatus.CLOSED || current == TicketStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot change status of a closed or rejected ticket");
        }

        boolean admin = "ADMIN".equals(role);
        boolean tech = "TECHNICIAN".equals(role) || "STAFF".equals(role);
        boolean assignee = ticket.getAssigneeId() != null && ticket.getAssigneeId().equals(actorId);
        boolean submitter = ticket.getSubmitterId() != null && ticket.getSubmitterId().equals(actorId);

        if (next == TicketStatus.REJECTED) {
            if (!admin) {
                throw new IllegalArgumentException("Only an admin can reject a ticket");
            }
            if (resolutionNotes == null || resolutionNotes.isBlank()) {
                throw new IllegalArgumentException("A rejection reason is required");
            }
            if (current != TicketStatus.OPEN && current != TicketStatus.IN_PROGRESS) {
                throw new IllegalArgumentException("Tickets can only be rejected while OPEN or IN_PROGRESS");
            }
            return;
        }

        switch (current) {
            case OPEN -> {
                if (next == TicketStatus.IN_PROGRESS) {
                    if (!admin && !tech) {
                        throw new IllegalArgumentException("Only admin or technician can move a ticket to IN_PROGRESS");
                    }
                    return;
                }
                throw new IllegalArgumentException("Invalid transition from OPEN to " + next);
            }
            case IN_PROGRESS -> {
                if (next == TicketStatus.RESOLVED) {
                    if (!admin && !assignee) {
                        throw new IllegalArgumentException("Only the assignee or an admin can mark a ticket resolved");
                    }
                    if (resolutionNotes == null || resolutionNotes.isBlank()) {
                        throw new IllegalArgumentException("Resolution notes are required when marking a ticket resolved");
                    }
                    return;
                }
                throw new IllegalArgumentException("Invalid transition from IN_PROGRESS to " + next);
            }
            case RESOLVED -> {
                if (next == TicketStatus.CLOSED) {
                    if (!admin && !submitter) {
                        throw new IllegalArgumentException("Only admin or the submitter can close a resolved ticket");
                    }
                    return;
                }
                throw new IllegalArgumentException("Invalid transition from RESOLVED to " + next);
            }
            default -> throw new IllegalArgumentException("Unsupported status transition");
        }
    }

    public IncidentTicket assignTicket(String id, String assigneeId, String actorId, String actorRole) {
        if (!"ADMIN".equals(normalizeRole(actorRole))) {
            throw new IllegalArgumentException("Only an admin can assign a technician");
        }
        IncidentTicket ticket = getTicketById(id);
        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot assign a closed or rejected ticket");
        }
        ticket.setAssigneeId(assigneeId != null ? assigneeId.trim() : null);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        return ticketRepository.save(ticket);
    }

    public IncidentTicket updateTicketDetails(String id, TicketUpdateRequest request) {
        IncidentTicket ticket = getTicketById(id);
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new IllegalArgumentException("Ticket details can only be edited while the ticket is OPEN");
        }
        String role = normalizeRole(request.getActorRole());
        boolean admin = "ADMIN".equals(role);
        boolean owner = ticket.getSubmitterId() != null && ticket.getSubmitterId().equals(request.getActorId().trim());
        if (!admin && !owner) {
            throw new IllegalArgumentException("Only the submitter or an admin can edit ticket details");
        }

        boolean any = false;
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            ticket.setDescription(request.getDescription().trim());
            any = true;
        }
        if (request.getContactDetails() != null && !request.getContactDetails().isBlank()) {
            ticket.setContactDetails(request.getContactDetails().trim());
            any = true;
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            ticket.setCategory(request.getCategory().trim());
            any = true;
        }
        if (!any) {
            throw new IllegalArgumentException("Provide at least one field to update (description, contactDetails, or category)");
        }

        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id, String actorId, String actorRole) {
        IncidentTicket ticket = getTicketById(id);
        String role = normalizeRole(actorRole);
        boolean admin = "ADMIN".equals(role);
        boolean owner = ticket.getSubmitterId() != null && ticket.getSubmitterId().equals(actorId != null ? actorId.trim() : "");
        if (!admin && !(owner && ticket.getStatus() == TicketStatus.OPEN)) {
            throw new IllegalArgumentException("Only an admin can delete any ticket, or the submitter can delete an OPEN ticket");
        }
        ticketCommentRepository.deleteByTicketId(id);
        ticketRepository.delete(ticket);
    }

    private static String normalizeRole(String role) {
        return role == null ? "" : role.trim().toUpperCase(Locale.ROOT);
    }
}
