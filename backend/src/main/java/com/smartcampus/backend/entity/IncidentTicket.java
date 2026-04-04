package com.smartcampus.backend.entity;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "incident_tickets")
public class IncidentTicket {
    
    @Id
    private String id;
    
    private String resourceId;
    private String location;
    private String category;
    private String description;
    
    private TicketPriority priority;
    
    private String contactDetails;
    
    private TicketStatus status = TicketStatus.OPEN;
    
    // ID of the assigned staff/technician
    private String assigneeId;
    
    private String resolutionNotes;
    
    private List<String> imagePaths = new ArrayList<>();
    
    // Submitter ID or info
    private String submitterId;

    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
