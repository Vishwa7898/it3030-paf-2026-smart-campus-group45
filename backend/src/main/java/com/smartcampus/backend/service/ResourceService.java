package com.smartcampus.backend.service;

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
        LocalDateTime now = LocalDateTime.now();
        resource.setCreatedAt(now);
        resource.setUpdatedAt(now);
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
        Resource existingResource = getResourceById(id);

        if (updatedResource.getName() != null) {
            existingResource.setName(updatedResource.getName());
        }
        if (updatedResource.getType() != null) {
            existingResource.setType(updatedResource.getType());
        }
        if (updatedResource.getLocation() != null) {
            existingResource.setLocation(updatedResource.getLocation());
        }
        if (updatedResource.getCapacity() != null) {
            existingResource.setCapacity(updatedResource.getCapacity());
        }
        if (updatedResource.getStatus() != null) {
            existingResource.setStatus(updatedResource.getStatus());
        }
        if (updatedResource.getDescription() != null) {
            existingResource.setDescription(updatedResource.getDescription());
        }
        if (updatedResource.getAmenities() != null) {
            existingResource.setAmenities(updatedResource.getAmenities());
        }
        if (updatedResource.getImageUrl() != null) {
            existingResource.setImageUrl(updatedResource.getImageUrl());
        }
        if (updatedResource.getAvailabilityWindow() != null) {
            existingResource.setAvailabilityWindow(updatedResource.getAvailabilityWindow());
        }
        if (updatedResource.getBuilding() != null) {
            existingResource.setBuilding(updatedResource.getBuilding());
        }
        if (updatedResource.getFloor() != null) {
            existingResource.setFloor(updatedResource.getFloor());
        }

        existingResource.setUpdatedAt(LocalDateTime.now());
        return resourceRepository.save(existingResource);
    }

    /**
* Partially update a resource (PATCH operation).
    */
    public Resource partialUpdateResource(String id, Resource patchResource) {
        return updateResource(id, patchResource);
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
}
