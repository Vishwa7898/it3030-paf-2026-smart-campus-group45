package com.smartcampus.backend.dto;

import com.smartcampus.backend.entity.IncidentTicket;
import com.smartcampus.backend.entity.TicketComment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentTicketView {
    private IncidentTicket ticket;
    private List<TicketComment> comments;
}
