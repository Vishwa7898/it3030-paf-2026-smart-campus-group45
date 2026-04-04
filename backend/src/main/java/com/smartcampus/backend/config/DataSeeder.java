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
                    .roomNumber("101")
                    .type("SINGLE")
                    .capacity(1)
                    .currentOccupancy(0)
                    .pricePerSemester(500.0)
                    .description("Quiet single room for focused study. Features an attached bathroom and A/C.")
                    .images(List.of("https://images.unsplash.com/photo-1522771731470-8ee07da061de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"))
                    .build();

            Room room2 = Room.builder()
                    .roomNumber("102")
                    .type("DOUBLE")
                    .capacity(2)
                    .currentOccupancy(1)
                    .pricePerSemester(350.0)
                    .description("Spacious double room with shared amenities, perfect for living with a friend.")
                    .images(List.of("https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"))
                    .build();

            Room room3 = Room.builder()
                    .roomNumber("103")
                    .type("TRIPLE")
                    .capacity(3)
                    .currentOccupancy(3) // Fully occupied
                    .pricePerSemester(250.0)
                    .description("Affordable triple room close to the cafeteria. Great community vibe.")
                    .images(List.of("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"))
                    .build();

            roomRepository.saveAll(List.of(room1, room2, room3));
            System.out.println("Initial rooms seeded.");
        }
    }
}
