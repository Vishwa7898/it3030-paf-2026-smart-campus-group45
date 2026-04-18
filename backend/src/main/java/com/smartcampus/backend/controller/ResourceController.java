package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;
import com.smartcampus.backend.service.FileStorageService;
import com.smartcampus.backend.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST Controller for Resource Management.
 * Implements Module A: Facilities & Assets Catalogue endpoints.
 * Covers Member 1's responsibility: Facilities catalogue + resource management endpoints
 *
 * Endpoints summary:
 * - POST   /api/resources                    Create new resource
 * - GET    /api/resources                    List all resources (with filters)
 * - GET    /api/resources/search             Search resources by keyword
 * - GET    /api/resources/location/{location} Filter by location
 * - GET    /api/resources/status/active     List ACTIVE resources (literal path; registered before /status/{status})
 * - GET    /api/resources/status/{status}   Filter by status
 * - GET    /api/resources/{id}               Get single resource
 * - PUT    /api/resources/{id}               Update entire resource
 * - PATCH  /api/resources/{id}               Partial update
 * - DELETE /api/resources/{id}               Delete resource
 */
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For local development
public class ResourceController {
    private final ResourceService resourceService;
    private final FileStorageService fileStorageService;

    /**
* CREATE: POST /api/resources
     * Create a new resource with type, capacity, location, and status.
     *
     * @param resource Resource object to create
     * @return Created resource with HTTP 201
     */
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Resource> createResource(
            @Valid @ModelAttribute Resource resource,
            @RequestPart(value = "file", required = false) MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required when creating a resource");
        }
        String imagePath = fileStorageService.storeFile(file, false);
        resource.setImageUrl(imagePath);

        return new ResponseEntity<>(resourceService.createResource(resource), HttpStatus.CREATED);
    }

    @PostMapping(consumes = {"application/json"})
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        return new ResponseEntity<>(resourceService.createResource(resource), HttpStatus.CREATED);
    }

    /**
* READ: GET /api/resources
     * Retrieve all resources with optional filtering.
     * Supports filtering by: type, minCapacity, location, status
     *
     * @param type        Filter by ResourceType
     * @param minCapacity Minimum capacity filter
     * @param location    Location substring filter
     * @param status      Filter by ResourceStatus
     * @return List of resources matching filters
     */
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status) {
        return ResponseEntity.ok(resourceService.getAllResources(type, minCapacity, location, status));
    }

    /**
* SEARCH: GET /api/resources/search?keyword=query
     * Search resources by name or description keyword.
     *
     * @param keyword Search term
     * @return List of matching resources
     */
    @GetMapping("/search")
    public ResponseEntity<List<Resource>> searchResources(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(resourceService.searchResources(keyword));
    }

    /**
* FILTER BY LOCATION: GET /api/resources/location/{location}
     * Filter resources by location.
     *
     * @param location Location name or substring
     * @return List of resources in that location
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<List<Resource>> getResourcesByLocation(@PathVariable String location) {
        return ResponseEntity.ok(resourceService.filterByLocation(location));
    }

    /**
     * Active resources shortcut (literal path must be registered before {@code /status/{status}}
     * so {@code /status/active} is not misread as an enum value).
     */
    @GetMapping("/status/active")
    public ResponseEntity<List<Resource>> getActiveResources() {
        return ResponseEntity.ok(resourceService.getActiveResources());
    }

    /**
* FILTER BY STATUS: GET /api/resources/status/{status}
     * Filter resources by status (ACTIVE, OUT_OF_SERVICE, MAINTENANCE, INACTIVE).
     *
     * @param status Resource status filter
     * @return List of resources with that status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Resource>> getResourcesByStatus(@PathVariable ResourceStatus status) {
        return ResponseEntity.ok(resourceService.filterByStatus(status));
    }

    /**
* READ: GET /api/resources/{id}
     * Retrieve a single resource by ID.
     *
     * @param id Resource ID
     * @return Resource object or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    /**
* UPDATE: PUT /api/resources/{id}
     * Full update of a resource (all fields required).
     *
     * @param id       Resource ID
     * @param resource Updated resource object
     * @return Updated resource
     */
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Resource> updateResource(
            @PathVariable String id,
            @Valid @ModelAttribute Resource resource,
            @RequestPart(value = "file", required = false) MultipartFile file) throws Exception {
        if (file != null && !file.isEmpty()) {
            String imagePath = fileStorageService.storeFile(file);
            resource.setImageUrl(imagePath);
        }

        return ResponseEntity.ok(resourceService.replaceResource(id, resource));
    }

    @PutMapping(value = "/{id}", consumes = {"application/json"})
    public ResponseEntity<Resource> updateResource(
            @PathVariable String id,
            @Valid @RequestBody Resource resource) {
        return ResponseEntity.ok(resourceService.replaceResource(id, resource));
    }

    /**
* PARTIAL UPDATE: PATCH /api/resources/{id}
     * Partial update of a resource (only provided fields are updated).
     *
     * @param id           Resource ID
     * @param partialResource Resource with fields to update
     * @return Updated resource
     */
    @PatchMapping("/{id}")
    public ResponseEntity<Resource> partialUpdateResource(
            @PathVariable String id,
            @RequestBody Resource partialResource) {
        return ResponseEntity.ok(resourceService.partialUpdateResource(id, partialResource));
    }

    /**
* UPDATE STATUS: PATCH /api/resources/{id}/status
     * Update only the status of a resource.
     *
     * @param id     Resource ID
     * @param status New status value
     * @return Updated resource
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Resource> updateResourceStatus(
            @PathVariable String id,
            @RequestParam ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }

    /**
* DELETE: DELETE /api/resources/{id}
     * Delete a resource by ID.
     *
     * @param id Resource ID
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
