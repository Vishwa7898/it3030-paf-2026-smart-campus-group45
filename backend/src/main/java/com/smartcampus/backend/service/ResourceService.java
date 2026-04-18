package com.smartcampus.backend.service;

import com.smartcampus.backend.exception.DuplicateResourceException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;
import com.smartcampus.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Resource management.
 * Implements Module A: Facilities & Assets Catalogue business logic.
 */
@Service
@RequiredArgsConstructor
public class ResourceService {
    private final ResourceRepository resourceRepository;

    /**
 * Create a new resource with timestamps.
 */
    public Resource createResource(Resource resource) {
        normalizeResource(resource);
        validateUniqueNameAndLocation(resource.getName(), resource.getLocation(), null);

        LocalDateTime now = LocalDateTime.now();
        resource.setCreatedAt(now);
        resource.setUpdatedAt(now);

        // Ensure newly created resources are active by default.
        if (resource.getStatus() == null) {
            resource.setStatus(ResourceStatus.ACTIVE);
        }
        return resourceRepository.save(resource);
    }

    /**
* Get all resources with optional filtering by type, capacity, location, and status.
    */
    public List<Resource> getAllResources(ResourceType type, Integer minCapacity,
                                          String location, ResourceStatus status) {
        List<Resource> resources = resourceRepository.findAll();

        // Apply filters
        if (type != null) {
            resources = resources.stream()
                    .filter(r -> r.getType() == type)
                    .collect(Collectors.toList());
        }
        if (minCapacity != null) {
            resources = resources.stream()
                    .filter(r -> r.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
        }
        if (location != null && !location.isEmpty()) {
            resources = resources.stream()
                    .filter(r -> r.getLocation().toLowerCase().contains(location.toLowerCase()))
                    .collect(Collectors.toList());
        }
        if (status != null) {
            resources = resources.stream()
                    .filter(r -> r.getStatus() == status)
                    .collect(Collectors.toList());
        }

        return resources;
    }

    /**
* Get resource by ID.
    */
    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
    }

    /**
* Search resources by name or description keyword.
    */
    public List<Resource> searchResources(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return resourceRepository.findAll();
        }
        String lowerKeyword = keyword.toLowerCase();
        return resourceRepository.findAll().stream()
                .filter(r -> r.getName().toLowerCase().contains(lowerKeyword) ||
                        (r.getDescription() != null && r.getDescription().toLowerCase().contains(lowerKeyword)))
                .collect(Collectors.toList());
    }

    /**
* Filter resources by location.
    */
    public List<Resource> filterByLocation(String location) {
        return resourceRepository.findByLocationContaining(location);
    }

    /**
* Filter resources by status.
    */
    public List<Resource> filterByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status);
    }

    /**
* Filter resources by type and status.
    */
    public List<Resource> filterByTypeAndStatus(ResourceType type, ResourceStatus status) {
        return resourceRepository.findByStatusAndType(status, type);
    }

    /**
* Update an existing resource.
    */
    public Resource updateResource(String id, Resource updatedResource) {
        return replaceResource(id, updatedResource);
    }

    /**
* Replace an existing resource (PUT semantics).
    */
    public Resource replaceResource(String id, Resource updatedResource) {
        Resource existingResource = getResourceById(id);
        normalizeResource(updatedResource);
        validateUniqueNameAndLocation(updatedResource.getName(), updatedResource.getLocation(), id);

        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setStatus(updatedResource.getStatus());
        existingResource.setDescription(updatedResource.getDescription());
        existingResource.setAmenities(updatedResource.getAmenities());
        existingResource.setAvailabilityWindow(updatedResource.getAvailabilityWindow());
        existingResource.setBuilding(updatedResource.getBuilding());
        existingResource.setFloor(updatedResource.getFloor());
        existingResource.setDailyCost(updatedResource.getDailyCost());
        existingResource.setContactPerson(updatedResource.getContactPerson());
        existingResource.setPhoneNumber(updatedResource.getPhoneNumber());

        if (updatedResource.getImageUrl() != null) {
            existingResource.setImageUrl(updatedResource.getImageUrl());
        }

        existingResource.setUpdatedAt(LocalDateTime.now());
        return resourceRepository.save(existingResource);
    }

    /**
* Partially update a resource (PATCH operation).
    */
    public Resource partialUpdateResource(String id, Resource patchResource) {
        Resource existingResource = getResourceById(id);

        if (patchResource.getName() != null) {
            existingResource.setName(patchResource.getName());
        }
        if (patchResource.getType() != null) {
            existingResource.setType(patchResource.getType());
        }
        if (patchResource.getLocation() != null) {
            existingResource.setLocation(patchResource.getLocation());
        }
        if (patchResource.getCapacity() != null) {
            existingResource.setCapacity(patchResource.getCapacity());
        }
        if (patchResource.getStatus() != null) {
            existingResource.setStatus(patchResource.getStatus());
        }
        if (patchResource.getDescription() != null) {
            existingResource.setDescription(patchResource.getDescription());
        }
        if (patchResource.getAmenities() != null) {
            existingResource.setAmenities(patchResource.getAmenities());
        }
        if (patchResource.getImageUrl() != null) {
            existingResource.setImageUrl(patchResource.getImageUrl());
        }
        if (patchResource.getAvailabilityWindow() != null) {
            existingResource.setAvailabilityWindow(patchResource.getAvailabilityWindow());
        }
        if (patchResource.getBuilding() != null) {
            existingResource.setBuilding(patchResource.getBuilding());
        }
        if (patchResource.getFloor() != null) {
            existingResource.setFloor(patchResource.getFloor());
        }
        if (patchResource.getDailyCost() != null) {
            existingResource.setDailyCost(patchResource.getDailyCost());
        }
        if (patchResource.getContactPerson() != null) {
            existingResource.setContactPerson(patchResource.getContactPerson());
        }
        if (patchResource.getPhoneNumber() != null) {
            existingResource.setPhoneNumber(patchResource.getPhoneNumber());
        }

        normalizeResource(existingResource);
        validateUniqueNameAndLocation(existingResource.getName(), existingResource.getLocation(), id);

        existingResource.setUpdatedAt(LocalDateTime.now());
        return resourceRepository.save(existingResource);
    }

    /**
* Update resource status (e.g., mark as MAINTENANCE).
    */
    public Resource updateResourceStatus(String id, ResourceStatus newStatus) {
        Resource resource = getResourceById(id);
        resource.setStatus(newStatus);
        resource.setUpdatedAt(LocalDateTime.now());
        return resourceRepository.save(resource);
    }

    /**
* Delete a resource by ID.
    */
    public void deleteResource(String id) {
        Resource existingResource = getResourceById(id);
        resourceRepository.delete(existingResource);
    }

    /**
* Get all active resources.
    */
    public List<Resource> getActiveResources() {
        return resourceRepository.findByStatus(ResourceStatus.ACTIVE);
    }

    /**
* Get resource count by type.
    */
    public long getResourceCount() {
        return resourceRepository.count();
    }

    private void normalizeResource(Resource resource) {
        if (resource.getName() != null) {
            resource.setName(sanitizeText(resource.getName()));
        }
        if (resource.getLocation() != null) {
            resource.setLocation(sanitizeText(resource.getLocation()));
        }
        if (resource.getDescription() != null) {
            resource.setDescription(resource.getDescription().trim());
        }
    }

    private String sanitizeText(String value) {
        return value.trim().replace("<", "").replace(">", "");
    }

    private void validateUniqueNameAndLocation(String name, String location, String currentId) {
        if (name == null || location == null) {
            return;
        }
        resourceRepository.findByNameIgnoreCaseAndLocationIgnoreCase(name, location)
                .ifPresent(existing -> {
                    if (currentId == null || !existing.getId().equals(currentId)) {
                        throw new DuplicateResourceException("A resource with the same name and location already exists");
                    }
                });
    }
}
