package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {
    List<TicketComment> findByTicketIdOrderByCreatedAtDesc(String ticketId);

    void deleteByTicketId(String ticketId);
}
