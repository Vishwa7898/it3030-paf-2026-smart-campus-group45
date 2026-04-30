package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.IncidentTicket;
import com.smartcampus.backend.entity.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
    List<IncidentTicket> findByStatus(TicketStatus status);
    List<IncidentTicket> findBySubmitterId(String submitterId);
    List<IncidentTicket> findByAssigneeId(String assigneeId);
}
