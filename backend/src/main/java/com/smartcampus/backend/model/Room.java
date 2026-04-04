package com.smartcampus.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rooms")
public class Room {
    @Id
    private String id;
    
    private String name;
    private String location;
    
    private String roomNumber;
    
    // e.g. SINGLE, DOUBLE, TRIPLE
    private String type;
    
    private int capacity;
    
    private int currentOccupancy;
    
    // Array of image URIs or Base64 strings
    private List<String> images;
    
    // Additional details like A/C, attached bathroom, etc.
    private String description;
    
    private double pricePerSemester;
}
