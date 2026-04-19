package com.smartcampus.backend.services;

import com.smartcampus.backend.dto.StudentTicketView;
import com.smartcampus.backend.dto.TicketRequest;
import com.smartcampus.backend.dto.TicketUpdateRequest;
import com.smartcampus.backend.entity.IncidentTicket;
import com.smartcampus.backend.entity.TicketComment;
import com.smartcampus.backend.entity.TicketPriority;
import com.smartcampus.backend.entity.TicketStatus;
import com.smartcampus.backend.exception.ForbiddenException;
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
        ticket.setResourceId(trimOrDefault(request.getResourceId(), "—"));
        ticket.setLocation(trimOrDefault(request.getLocation(), "—"));
        ticket.setCategory(request.getCategory().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority());
        ticket.setContactDetails(request.getContactDetails().trim());
        ticket.setSubmitterId(request.getSubmitterId().trim());
        ticket.setStatus(TicketStatus.OPEN);

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

    private static String trimOrDefault(String value, String defaultIfBlank) {
        if (value == null || value.isBlank()) {
            return defaultIfBlank;
        }
        return value.trim();
    }

    public List<StudentTicketView> getMyTicketsWithComments(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("studentId is required");
        }
        String sid = studentId.trim();
        List<IncidentTicket> tickets = ticketRepository.findBySubmitterId(sid);
        List<StudentTicketView> out = new ArrayList<>();
        for (IncidentTicket t : tickets) {
            List<TicketComment> comments =
                    ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(t.getId());
            out.add(new StudentTicketView(t, comments));
        }
        return out;
    }

    public List<IncidentTicket> findAssignedTickets(String technicianId) {
        if (technicianId == null || technicianId.isBlank()) {
            throw new IllegalArgumentException("technicianId is required");
        }
        return new ArrayList<>(ticketRepository.findByAssigneeId(technicianId.trim()));
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
                                            String q,
                                            String viewerId,
                                            String viewerRole) {
        List<IncidentTicket> list;
        String role = viewerRole != null ? viewerRole.trim().toUpperCase(Locale.ROOT) : "";

        if ("USER".equals(role)) {
            if (viewerId == null || viewerId.isBlank()) {
                throw new IllegalArgumentException("viewerId is required for student (USER) requests");
            }
            list = new ArrayList<>(ticketRepository.findBySubmitterId(viewerId.trim()));
        } else if (("TECHNICIAN".equals(role) || "STAFF".equals(role)) && !"ADMIN".equals(role)) {
            if (viewerId == null || viewerId.isBlank()) {
                throw new IllegalArgumentException("viewerId is required for technician requests");
            }
            list = new ArrayList<>(ticketRepository.findByAssigneeId(viewerId.trim()));
        } else if (submitterId != null && !submitterId.isBlank()) {
            list = new ArrayList<>(ticketRepository.findBySubmitterId(submitterId.trim()));
        } else if (assigneeId != null && !assigneeId.isBlank()) {
            list = new ArrayList<>(ticketRepository.findByAssigneeId(assigneeId.trim()));
        } else if (status != null) {
            list = new ArrayList<>(ticketRepository.findByStatus(status));
        } else {
            list = new ArrayList<>(ticketRepository.findAll());
        }

        boolean viewerScopedRole = "USER".equals(role) || "TECHNICIAN".equals(role) || "STAFF".equals(role);
        if (status != null
                && (viewerScopedRole
                || submitterId != null && !submitterId.isBlank()
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

    public IncidentTicket getTicketById(String id, String viewerId, String viewerRole) {
        IncidentTicket ticket = requireTicket(id);

        String role = viewerRole != null ? viewerRole.trim().toUpperCase(Locale.ROOT) : "";
        if ("USER".equals(role)) {
            if (viewerId == null || viewerId.isBlank()) {
                throw new IllegalArgumentException("viewerId is required for student (USER) requests");
            }
            if (!viewerId.trim().equals(ticket.getSubmitterId())) {
                throw new ForbiddenException("You can only view your own tickets");
            }
        } else if ("TECHNICIAN".equals(role) || "STAFF".equals(role)) {
            if (viewerId == null || viewerId.isBlank()) {
                throw new IllegalArgumentException("viewerId is required for technician requests");
            }
            if (!viewerId.trim().equals(ticket.getAssigneeId())) {
                throw new ForbiddenException("Technicians can only view assigned tickets");
            }
        }
        return ticket;
    }

    /** Load ticket for internal service use (no viewer ACL). */
    public IncidentTicket requireTicket(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    public IncidentTicket updateTicketStatus(String id,
                                             TicketStatus newStatus,
                                             String resolutionNotes,
                                             String actorId,
                                             String actorRole) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
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

        if (next == TicketStatus.REJECTED) {
            if (!admin) {
                throw new IllegalArgumentException("Only an admin can reject a ticket");
            }
            if (resolutionNotes == null || resolutionNotes.isBlank()) {
                throw new IllegalArgumentException("A rejection reason is required (use reason or resolutionNotes)");
            }
            if (current == TicketStatus.CLOSED || current == TicketStatus.REJECTED) {
                throw new IllegalArgumentException("Cannot reject a closed or rejected ticket");
            }
            return;
        }

        switch (current) {
            case OPEN -> {
                if (next == TicketStatus.IN_PROGRESS) {
                    if (!tech || !assignee) {
                        throw new IllegalArgumentException("Only the assigned technician can start work (OPEN → IN_PROGRESS)");
                    }
                    return;
                }
                throw new IllegalArgumentException("Invalid transition from OPEN to " + next);
            }
            case IN_PROGRESS -> {
                if (next == TicketStatus.RESOLVED) {
                    if (!assignee || !tech) {
                        throw new IllegalArgumentException("Only the assigned technician can mark a ticket resolved");
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
                    if (!admin && !(tech && assignee)) {
                        throw new IllegalArgumentException("Only an admin or the assigned technician can close a resolved ticket");
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
        IncidentTicket ticket = requireTicket(id);
        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot assign a closed or rejected ticket");
        }
        ticket.setAssigneeId(assigneeId != null ? assigneeId.trim() : null);
        return ticketRepository.save(ticket);
    }

    public IncidentTicket updateTicketDetails(String id, TicketUpdateRequest request) {
        IncidentTicket ticket = requireTicket(id);
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
        IncidentTicket ticket = requireTicket(id);
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
