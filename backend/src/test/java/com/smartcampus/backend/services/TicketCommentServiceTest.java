package com.smartcampus.backend.services;

import com.smartcampus.backend.entity.TicketComment;
import com.smartcampus.backend.repository.TicketCommentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketCommentServiceTest {

    @Mock
    TicketCommentRepository commentRepository;

    @Mock
    IncidentTicketService ticketService;

    @InjectMocks
    TicketCommentService commentService;

    @Test
    void adminCanDeleteOthersComment() {
        TicketComment c = new TicketComment();
        c.setId("c1");
        c.setAuthorId("alice");
        when(commentRepository.findById("c1")).thenReturn(Optional.of(c));

        commentService.deleteComment("c1", "bob", "ADMIN");

        verify(commentRepository).delete(c);
    }

    @Test
    void userCannotDeleteOthersComment() {
        TicketComment c = new TicketComment();
        c.setId("c1");
        c.setAuthorId("alice");
        when(commentRepository.findById("c1")).thenReturn(Optional.of(c));

        assertThatThrownBy(() -> commentService.deleteComment("c1", "bob", "USER"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("authorized");
    }

    @Test
    void technicianCannotDeleteOthersComment() {
        TicketComment c = new TicketComment();
        c.setId("c1");
        c.setAuthorId("alice");
        when(commentRepository.findById("c1")).thenReturn(Optional.of(c));

        assertThatThrownBy(() -> commentService.deleteComment("c1", "bob", "TECHNICIAN"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("authorized");
    }
}
