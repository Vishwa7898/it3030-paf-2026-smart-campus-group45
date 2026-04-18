package com.smartcampus.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the operational hours/availability window for a resource.
 * Implements Module A requirement for availability windows.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityWindow {
    private String dayOfWeek; // e.g., "MONDAY", "TUESDAY", etc.
    private String openingTime; // e.g., "09:00"
    private String closingTime; // e.g., "17:00"
    private boolean isOpen; // Is the resource open on this day?

    /**
     * Standard weekday hours constructor
     */
    public AvailabilityWindow(String dayOfWeek, String openingTime, String closingTime) {
        this.dayOfWeek = dayOfWeek;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.isOpen = true;
    }
}
