package com.smartcampus.backend.service;

import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceType;
import com.smartcampus.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {
    private final ResourceRepository resourceRepository;

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public List<Resource> getAllResources(ResourceType type, Integer minCapacity) {
        if (type != null) {
            return resourceRepository.findByType(type);
        }
        if (minCapacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        }
        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
    }

    public Resource updateResource(String id, Resource updatedResource) {
        Resource existingResource = getResourceById(id);
        
        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setAvailable(updatedResource.getAvailable());
        existingResource.setImageUrl(updatedResource.getImageUrl());
        
        return resourceRepository.save(existingResource);
    }

    public void deleteResource(String id) {
        Resource existingResource = getResourceById(id);
        resourceRepository.delete(existingResource);
    }
}
