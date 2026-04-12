package com.smartcampus.backend.model;

/**
 * Enumeration for resource status.
 * Implements Module A requirement for status tracking (ACTIVE / OUT_OF_SERVICE).
 */
public enum ResourceStatus {
    ACTIVE("Active and available for booking"),
    OUT_OF_SERVICE("Out of service - temporarily unavailable"),
    MAINTENANCE("Under maintenance"),
    INACTIVE("Inactive - no longer in use");

    private final String description;

    ResourceStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
