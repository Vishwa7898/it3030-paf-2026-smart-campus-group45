package com.smartcampus.backend.model;

/**
 * Enumeration of resource types available in the Smart Campus system.
 * Used to categorize different facilities and assets as per Module A requirements.
 */
public enum ResourceType {
    LECTURE_HALL("Lecture Hall"),
    LAB("Laboratory"),
    MEETING_ROOM("Meeting Room"),
    EQUIPMENT("Equipment"),
    COMMON_AREA("Common Area"),
    SPORTS_FACILITY("Sports Facility"),
    AUDITORIUM("Auditorium"),
    SEMINAR_ROOM("Seminar Room");

    private final String displayName;

    ResourceType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
