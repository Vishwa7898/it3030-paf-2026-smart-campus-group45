package com.smartcampus.backend.config;

import com.smartcampus.backend.model.Room;
import com.smartcampus.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoomRepository roomRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roomRepository.count() == 0) {
            System.out.println("Seeding database with initial rooms...");
            
            Room room1 = Room.builder()
                    .name("Main Library Study Room 1")
                    .location("Library Ground Floor")
                    .roomNumber("101")
                    .type("ROOM")
                    .capacity(1)
                    .currentOccupancy(0)
                    .pricePerSemester(500.0)
                    .description("Quiet single room for focused study. Features an attached bathroom and A/C.")
                    .images(List.of("https://images.unsplash.com/photo-1522771731470-8ee07da061de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"))
                    .build();

            Room room2 = Room.builder()
                    .name("Computer Science Lab A")
                    .location("IT Building Floor 2")
                    .roomNumber("102")
                    .type("LAB")
                    .capacity(30)
                    .currentOccupancy(0)
                    .pricePerSemester(0.0)
                    .description("High performance machines with dual monitors.")
                    .images(List.of("https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"))
                    .build();

            Room room3 = Room.builder()
                    .name("Projector and Sound System")
                    .location("Equipment Room 3")
                    .roomNumber("103")
                    .type("EQUIPMENT")
                    .capacity(1)
                    .currentOccupancy(0)
                    .pricePerSemester(0.0)
                    .description("Portable projector with Bluetooth sound system for presentations.")
                    .images(List.of("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"))
                    .build();

            roomRepository.saveAll(List.of(room1, room2, room3));
            System.out.println("Initial rooms seeded.");
        }
    }
}
