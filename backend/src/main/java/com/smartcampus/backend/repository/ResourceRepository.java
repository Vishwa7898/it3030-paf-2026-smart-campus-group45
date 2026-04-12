package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Resource entity with advanced search and filtering.
 * Supports Module A: Facilities & Assets Catalogue operations.
 */
@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    // Type-based queries
    List<Resource> findByType(ResourceType type);

    // Capacity-based queries
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
    List<Resource> findByCapacityBetween(Integer minCapacity, Integer maxCapacity);

    // Location-based queries
    List<Resource> findByLocationContaining(String location);
    List<Resource> findByLocationAndType(String location, ResourceType type);

    // Status-based queries
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByStatusAndType(ResourceStatus status, ResourceType type);

    // Name-based search
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Resource> searchByName(String keyword);

    // Building and floor search
    List<Resource> findByBuilding(String building);
    List<Resource> findByBuildingAndFloor(String building, String floor);

    // Combined queries
    @Query("{ 'capacity': { $gte: ?0 }, 'status': ?1, 'type': ?2 }")
    List<Resource> findByCriteriaOptimized(Integer minCapacity, ResourceStatus status, ResourceType type);
}
