package com.smartcampus.backend.services;

import com.smartcampus.backend.dto.TicketUpdateRequest;
import com.smartcampus.backend.entity.IncidentTicket;
import com.smartcampus.backend.entity.TicketStatus;
import com.smartcampus.backend.repository.IncidentTicketRepository;
import com.smartcampus.backend.repository.TicketCommentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentTicketServiceTest {

    @Mock
    IncidentTicketRepository ticketRepository;

    @Mock
    TicketCommentRepository ticketCommentRepository;

    @InjectMocks
    IncidentTicketService service;

    IncidentTicket openTicket;

    @BeforeEach
    void setUp() {
        openTicket = new IncidentTicket();
        openTicket.setId("t1");
        openTicket.setStatus(TicketStatus.OPEN);
        openTicket.setSubmitterId("student1");
        openTicket.setAssigneeId("tech1");
    }

    @Test
    void adminCanRejectOpenTicketWithReason() {
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.updateTicketStatus("t1", TicketStatus.REJECTED, "Invalid report", "admin1", "ADMIN");

        ArgumentCaptor<IncidentTicket> cap = ArgumentCaptor.forClass(IncidentTicket.class);
        verify(ticketRepository).save(cap.capture());
        assertThat(cap.getValue().getStatus()).isEqualTo(TicketStatus.REJECTED);
    }

    @Test
    void rejectRequiresReason() {
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));

        assertThatThrownBy(() ->
                service.updateTicketStatus("t1", TicketStatus.REJECTED, "  ", "admin1", "ADMIN"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reason");
    }

    @Test
    void assigneeCanResolveInProgressTicket() {
        openTicket.setStatus(TicketStatus.IN_PROGRESS);
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.updateTicketStatus("t1", TicketStatus.RESOLVED, "Fixed lamp", "tech1", "TECHNICIAN");

        verify(ticketRepository).save(any());
    }

    @Test
    void nonAssigneeCannotResolve() {
        openTicket.setStatus(TicketStatus.IN_PROGRESS);
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));

        assertThatThrownBy(() ->
                service.updateTicketStatus("t1", TicketStatus.RESOLVED, "Fixed", "other", "TECHNICIAN"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("assigned technician");
    }

    @Test
    void technicianCannotCloseResolvedTicket() {
        openTicket.setStatus(TicketStatus.RESOLVED);
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));

        assertThatThrownBy(() ->
                service.updateTicketStatus("t1", TicketStatus.CLOSED, null, "tech1", "TECHNICIAN"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("admin");
    }

    @Test
    void adminCanCloseResolvedTicket() {
        openTicket.setStatus(TicketStatus.RESOLVED);
        openTicket.setAssigneeId("tech1");
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.updateTicketStatus("t1", TicketStatus.CLOSED, null, "admin1", "ADMIN");

        verify(ticketRepository).save(any());
    }

    @Test
    void studentCannotCloseResolvedTicket() {
        openTicket.setStatus(TicketStatus.RESOLVED);
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));

        assertThatThrownBy(() ->
                service.updateTicketStatus("t1", TicketStatus.CLOSED, null, "student1", "USER"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("close");
    }

    @Test
    void assignKeepsTicketOpen() {
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.assignTicket("t1", "tech1", "admin1", "ADMIN");

        ArgumentCaptor<IncidentTicket> cap = ArgumentCaptor.forClass(IncidentTicket.class);
        verify(ticketRepository).save(cap.capture());
        assertThat(cap.getValue().getStatus()).isEqualTo(TicketStatus.OPEN);
        assertThat(cap.getValue().getAssigneeId()).isEqualTo("tech1");
    }

    @Test
    void assignedTechnicianCanStartInProgress() {
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.updateTicketStatus("t1", TicketStatus.IN_PROGRESS, null, "tech1", "TECHNICIAN");

        ArgumentCaptor<IncidentTicket> cap = ArgumentCaptor.forClass(IncidentTicket.class);
        verify(ticketRepository).save(cap.capture());
        assertThat(cap.getValue().getStatus()).isEqualTo(TicketStatus.IN_PROGRESS);
    }

    @Test
    void adminCannotMoveOpenToInProgress() {
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));

        assertThatThrownBy(() ->
                service.updateTicketStatus("t1", TicketStatus.IN_PROGRESS, null, "admin1", "ADMIN"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("assigned technician");
    }

    @Test
    void deleteOpenTicketBySubmitter() {
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));

        service.deleteTicket("t1", "student1", "USER");

        verify(ticketCommentRepository).deleteByTicketId("t1");
        verify(ticketRepository).delete(openTicket);
    }

    @Test
    void deleteRejectedTicketBySubmitter() {
        openTicket.setStatus(TicketStatus.REJECTED);
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));

        service.deleteTicket("t1", "student1", "USER");

        verify(ticketCommentRepository).deleteByTicketId("t1");
        verify(ticketRepository).delete(openTicket);
    }

    @Test
    void updateDetailsWhenOpen() {
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(openTicket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketUpdateRequest req = new TicketUpdateRequest();
        req.setDescription("Updated text");
        req.setActorId("student1");
        req.setActorRole("USER");

        IncidentTicket updated = service.updateTicketDetails("t1", req);

        assertThat(updated.getDescription()).isEqualTo("Updated text");
    }
}
