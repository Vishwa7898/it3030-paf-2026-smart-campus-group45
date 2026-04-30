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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {
    private final ResourceService resourceService;
    private final FileStorageService fileStorageService;

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

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status) {
        return ResponseEntity.ok(resourceService.getAllResources(type, minCapacity, location, status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Resource>> searchResources(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(resourceService.searchResources(keyword));
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<Resource>> getResourcesByLocation(@PathVariable String location) {
        return ResponseEntity.ok(resourceService.filterByLocation(location));
    }

    @GetMapping("/status/active")
    public ResponseEntity<List<Resource>> getActiveResources() {
        return ResponseEntity.ok(resourceService.getActiveResources());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Resource>> getResourcesByStatus(@PathVariable ResourceStatus status) {
        return ResponseEntity.ok(resourceService.filterByStatus(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

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

    @PatchMapping("/{id}")
    public ResponseEntity<Resource> partialUpdateResource(
            @PathVariable String id,
            @RequestBody Resource partialResource) {
        return ResponseEntity.ok(resourceService.partialUpdateResource(id, partialResource));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Resource> updateResourceStatus(
            @PathVariable String id,
            @RequestParam ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}