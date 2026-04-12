package com.smartcampus.backend.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Resource entity representing bookable facilities and assets.
 * Implements Module A: Facilities & Assets Catalogue requirements.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {
    @Id
    private String id;

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotNull(message = "Resource status is required")
    private ResourceStatus status = ResourceStatus.ACTIVE;

    private String description;
    private List<String> amenities;
    private String imageUrl;

    // Availability window for operational hours
    private AvailabilityWindow availabilityWindow;

    // Metadata timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Optional fields for advanced features
    private String floor;
    private String building;
    private Double dailyCost;
    private String contactPerson;
    private String phoneNumber;
}
