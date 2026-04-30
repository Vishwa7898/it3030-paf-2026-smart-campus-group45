package com.smartcampus.backend.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
    @Size(min = 3, max = 150, message = "Resource name must be between 3 and 150 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9 _.,&-]+$",
            message = "Invalid characters in resource name"
    )
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotBlank(message = "Location is required")
    @Size(min = 5, max = 200, message = "Location must be between 5 and 200 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9 .,\\-/()]+$",
            message = "Location contains invalid characters"
    )
    private String location;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @jakarta.validation.constraints.Max(value = 10000, message = "Capacity must be between 1 and 10000")
    private Integer capacity;

    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
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
