package com.smartcampus.backend.service;

import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;
import com.smartcampus.backend.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ResourceService.
 * Tests Module A: Facilities & Assets Catalogue functionality.
 * Member 1 Implementation
 */
@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource testResource;

    @BeforeEach
    void setUp() {
        testResource = new Resource();
        testResource.setId("resource-001");
        testResource.setName("Physics Lab");
        testResource.setType(ResourceType.LAB);
        testResource.setLocation("Building A - Room 205");
        testResource.setCapacity(30);
        testResource.setStatus(ResourceStatus.ACTIVE);
        testResource.setDescription("Physics laboratory with experiment stations");
        testResource.setCreatedAt(LocalDateTime.now());
        testResource.setUpdatedAt(LocalDateTime.now());
    }

    // ==================== CREATE TESTS ====================

    @Test
    void testCreateResource_Success() {
        // Arrange
        when(resourceRepository.save(any(Resource.class))).thenReturn(testResource);

        // Act
        Resource created = resourceService.createResource(testResource);

        // Assert
        assertNotNull(created);
        assertEquals("Physics Lab", created.getName());
        assertEquals(ResourceType.LAB, created.getType());
        assertEquals(30, created.getCapacity());
        assertNotNull(created.getCreatedAt());
        assertNotNull(created.getUpdatedAt());

        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    void testCreateResource_DefaultStatusActive() {
        // Arrange
        Resource resourceNoStatus = new Resource();
        resourceNoStatus.setName("Meeting Room");
        resourceNoStatus.setType(ResourceType.MEETING_ROOM);
        resourceNoStatus.setLocation("Building B");
        resourceNoStatus.setCapacity(20);
        resourceNoStatus.setStatus(null);

        when(resourceRepository.save(any(Resource.class))).thenAnswer(invocation -> {
            Resource arg = invocation.getArgument(0);
            if (arg.getStatus() == null) {
                arg.setStatus(ResourceStatus.ACTIVE);
            }
            return arg;
        });

        // Act
        Resource created = resourceService.createResource(resourceNoStatus);

        // Assert
        assertEquals(ResourceStatus.ACTIVE, created.getStatus());
    }

    // ==================== GET ALL TESTS ====================

    @Test
    void testGetAllResources_NoFilters() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        List<Resource> result = resourceService.getAllResources(null, null, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Physics Lab", result.get(0).getName());
        verify(resourceRepository, times(1)).findAll();
    }

    @Test
    void testGetAllResources_FilterByType() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        List<Resource> result = resourceService.getAllResources(ResourceType.LAB, null, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(ResourceType.LAB, result.get(0).getType());
    }

    @Test
    void testGetAllResources_FilterByCapacity() {
        // Arrange
        testResource.setCapacity(30);
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        List<Resource> result = resourceService.getAllResources(null, 25, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getCapacity() >= 25);
    }

    @Test
    void testGetAllResources_FilterByLocation() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        List<Resource> result = resourceService.getAllResources(null, null, "Building A", null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getLocation().contains("Building A"));
    }

    @Test
    void testGetAllResources_FilterByStatus() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        List<Resource> result = resourceService.getAllResources(null, null, null, ResourceStatus.ACTIVE);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(ResourceStatus.ACTIVE, result.get(0).getStatus());
    }

    @Test
    void testGetAllResources_MultipleFilters() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        List<Resource> result = resourceService.getAllResources(
                ResourceType.LAB, 25, "Building A", ResourceStatus.ACTIVE);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    // ==================== GET BY ID TESTS ====================

    @Test
    void testGetResourceById_Found() {
        // Arrange
        when(resourceRepository.findById("resource-001")).thenReturn(Optional.of(testResource));

        // Act
        Resource result = resourceService.getResourceById("resource-001");

        // Assert
        assertNotNull(result);
        assertEquals("Physics Lab", result.getName());
        verify(resourceRepository, times(1)).findById("resource-001");
    }

    @Test
    void testGetResourceById_NotFound() {
        // Arrange
        when(resourceRepository.findById("invalid-id")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            resourceService.getResourceById("invalid-id");
        });
    }

    // ==================== SEARCH TESTS ====================

    @Test
    void testSearchResources_ByName() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        List<Resource> result = resourceService.searchResources("physics");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getName().toLowerCase().contains("physics"));
    }

    @Test
    void testSearchResources_ByDescription() {
        // Arrange
        testResource.setDescription("Advanced physics lab equipment");
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        List<Resource> result = resourceService.searchResources("advanced");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testSearchResources_EmptyKeyword() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        List<Resource> result = resourceService.searchResources("");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testSearchResources_NullKeyword() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        List<Resource> result = resourceService.searchResources(null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    // ==================== FILTER BY LOCATION TESTS ====================

    @Test
    void testFilterByLocation() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findByLocationContaining("Building A"))
                .thenReturn(resources);

        // Act
        List<Resource> result = resourceService.filterByLocation("Building A");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getLocation().contains("Building A"));
        verify(resourceRepository, times(1)).findByLocationContaining("Building A");
    }

    // ==================== FILTER BY STATUS TESTS ====================

    @Test
    void testFilterByStatus_Active() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findByStatus(ResourceStatus.ACTIVE))
                .thenReturn(resources);

        // Act
        List<Resource> result = resourceService.filterByStatus(ResourceStatus.ACTIVE);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(ResourceStatus.ACTIVE, result.get(0).getStatus());
    }

    @Test
    void testFilterByStatus_Maintenance() {
        // Arrange
        testResource.setStatus(ResourceStatus.MAINTENANCE);
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findByStatus(ResourceStatus.MAINTENANCE))
                .thenReturn(resources);

        // Act
        List<Resource> result = resourceService.filterByStatus(ResourceStatus.MAINTENANCE);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(ResourceStatus.MAINTENANCE, result.get(0).getStatus());
    }

    // ==================== UPDATE TESTS ====================

    @Test
    void testUpdateResource_FullUpdate() {
        // Arrange
        Resource updatedResource = new Resource();
        updatedResource.setName("Advanced Physics Lab");
        updatedResource.setCapacity(40);
        updatedResource.setStatus(ResourceStatus.MAINTENANCE);

        when(resourceRepository.findById("resource-001")).thenReturn(Optional.of(testResource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(testResource);

        // Act
        Resource result = resourceService.updateResource("resource-001", updatedResource);

        // Assert
        assertNotNull(result);
        assertEquals("Advanced Physics Lab", result.getName());
        assertEquals(40, result.getCapacity());
        verify(resourceRepository, times(1)).findById("resource-001");
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    void testUpdateResource_PartialUpdate() {
        // Arrange
        Resource partialUpdate = new Resource();
        partialUpdate.setCapacity(35);

        when(resourceRepository.findById("resource-001")).thenReturn(Optional.of(testResource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(testResource);

        // Act
        resourceService.partialUpdateResource("resource-001", partialUpdate);

        // Assert
        verify(resourceRepository, times(1)).findById("resource-001");
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    void testUpdateResource_NotFound() {
        // Arrange
        when(resourceRepository.findById("invalid-id")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            resourceService.updateResource("invalid-id", testResource);
        });
    }

    // ==================== UPDATE STATUS TESTS ====================

    @Test
    void testUpdateResourceStatus() {
        // Arrange
        when(resourceRepository.findById("resource-001")).thenReturn(Optional.of(testResource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(testResource);

        // Act
        Resource result = resourceService.updateResourceStatus("resource-001", ResourceStatus.MAINTENANCE);

        // Assert
        assertNotNull(result);
        verify(resourceRepository, times(1)).findById("resource-001");
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    // ==================== DELETE TESTS ====================

    @Test
    void testDeleteResource_Success() {
        // Arrange
        when(resourceRepository.findById("resource-001")).thenReturn(Optional.of(testResource));
        doNothing().when(resourceRepository).delete(any(Resource.class));

        // Act
        resourceService.deleteResource("resource-001");

        // Assert
        verify(resourceRepository, times(1)).findById("resource-001");
        verify(resourceRepository, times(1)).delete(testResource);
    }

    @Test
    void testDeleteResource_NotFound() {
        // Arrange
        when(resourceRepository.findById("invalid-id")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            resourceService.deleteResource("invalid-id");
        });
    }

    // ==================== GET ACTIVE RESOURCES TESTS ====================

    @Test
    void testGetActiveResources() {
        // Arrange
        List<Resource> activeResources = Arrays.asList(testResource);
        when(resourceRepository.findByStatus(ResourceStatus.ACTIVE))
                .thenReturn(activeResources);

        // Act
        List<Resource> result = resourceService.getActiveResources();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.stream().allMatch(r -> r.getStatus() == ResourceStatus.ACTIVE));
    }

    // ==================== COUNT TESTS ====================

    @Test
    void testGetResourceCount() {
        // Arrange
        when(resourceRepository.count()).thenReturn(5L);

        // Act
        long count = resourceService.getResourceCount();

        // Assert
        assertEquals(5, count);
        verify(resourceRepository, times(1)).count();
    }

    // ==================== EDGE CASE TESTS ====================

    @Test
    void testFilterByTypeAndStatus() {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource);
        when(resourceRepository.findByStatusAndType(ResourceStatus.ACTIVE, ResourceType.LAB))
                .thenReturn(resources);

        // Act
        List<Resource> result = resourceService.filterByTypeAndStatus(ResourceType.LAB, ResourceStatus.ACTIVE);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetAllResources_EmptyResult() {
        // Arrange
        when(resourceRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<Resource> result = resourceService.getAllResources(null, null, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
    }
}
