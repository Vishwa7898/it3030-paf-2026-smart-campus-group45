# Module A - Quick Reference & Testing Guide

## API Base URL
```
http://localhost:8080/api/resources
```

## Environment Setup

### Prerequisites
- Java 21 (Spring Boot 4.0.5)
- MongoDB running locally or connection string configured
- Application started: `mvn spring-boot:run`

### MongoDB Connection (application.properties)
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/smart_campus
```

---

## Sample CURL Commands for Testing

### 1. CREATE - POST /api/resources

**Create Physics Lab:**
```bash
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Physics Lab",
    "type": "LAB",
    "location": "Building A - Room 205",
    "capacity": 30,
    "status": "ACTIVE",
    "description": "Physics laboratory with experiment stations",
    "amenities": ["Microscopes", "Bunsen Burners", "Safety Equipment"],
    "building": "Building A",
    "floor": "2",
    "contactPerson": "Dr. Smith",
    "phoneNumber": "+94-123-456-7890"
  }'
```

**Create Meeting Room:**
```bash
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conference Room A",
    "type": "MEETING_ROOM",
    "location": "Building B - Room 101",
    "capacity": 20,
    "status": "ACTIVE"
  }'
```

### 2. READ - GET /api/resources

**Get All Resources:**
```bash
curl http://localhost:8080/api/resources
```

**Get with Type Filter:**
```bash
curl http://localhost:8080/api/resources?type=LAB
```

**Get with Capacity Filter:**
```bash
curl http://localhost:8080/api/resources?minCapacity=25
```

**Get with Location Filter (combined):**
```bash
curl http://localhost:8080/api/resources?location=Building%20A&minCapacity=20
```

**Get with Status Filter:**
```bash
curl http://localhost:8080/api/resources?status=ACTIVE
```

**Combined Filters:**
```bash
curl "http://localhost:8080/api/resources?type=LAB&minCapacity=25&location=Building%20A&status=ACTIVE"
```

### 3. SEARCH - GET /api/resources/search

**Search by Keyword:**
```bash
curl http://localhost:8080/api/resources/search?keyword=physics
```

**Search Meeting Rooms:**
```bash
curl http://localhost:8080/api/resources/search?keyword=meeting
```

### 4. FILTER BY LOCATION - GET /api/resources/location/{location}

**Get all resources in Building A:**
```bash
curl http://localhost:8080/api/resources/location/Building%20A
```

**Get resources in specific room:**
```bash
curl "http://localhost:8080/api/resources/location/Room%20205"
```

### 5. FILTER BY STATUS - GET /api/resources/status/{status}

**Get Active Resources:**
```bash
curl http://localhost:8080/api/resources/status/ACTIVE
```

**Get Maintenance Resources:**
```bash
curl http://localhost:8080/api/resources/status/MAINTENANCE
```

**Get Out of Service Resources:**
```bash
curl http://localhost:8080/api/resources/status/OUT_OF_SERVICE
```

### 6. GET SINGLE - GET /api/resources/{id}

**Get specific resource (replace {id}):**
```bash
curl http://localhost:8080/api/resources/507f1f77bcf86cd799439011
```

### 7. UPDATE - PUT /api/resources/{id}

**Full Update (requires all fields):**
```bash
curl -X PUT http://localhost:8080/api/resources/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Physics Lab",
    "type": "LAB",
    "location": "Building A - Room 206",
    "capacity": 35,
    "status": "ACTIVE",
    "description": "Updated physics lab"
  }'
```

### 8. PARTIAL UPDATE - PATCH /api/resources/{id}

**Partial Update (update only capacity):**
```bash
curl -X PATCH http://localhost:8080/api/resources/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"capacity": 40}'
```

**Add Amenities:**
```bash
curl -X PATCH http://localhost:8080/api/resources/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "amenities": ["Projector", "Whiteboard", "Video Conference System"]
  }'
```

### 9. UPDATE STATUS - PATCH /api/resources/{id}/status

**Mark as Maintenance:**
```bash
curl -X PATCH "http://localhost:8080/api/resources/507f1f77bcf86cd799439011/status?status=MAINTENANCE"
```

**Mark as Out of Service:**
```bash
curl -X PATCH "http://localhost:8080/api/resources/507f1f77bcf86cd799439011/status?status=OUT_OF_SERVICE"
```

**Restore to Active:**
```bash
curl -X PATCH "http://localhost:8080/api/resources/507f1f77bcf86cd799439011/status?status=ACTIVE"
```

### 10. DELETE - DELETE /api/resources/{id}

**Delete Resource:**
```bash
curl -X DELETE http://localhost:8080/api/resources/507f1f77bcf86cd799439011
```

---

## Testing Workflow

### Step 1: Create Test Resources
```bash
# Create Lab
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chemistry Lab",
    "type": "LAB",
    "location": "Building A",
    "capacity": 25,
    "amenities": ["Fume Hoods", "Beakers"]
  }'

# Create Lecture Hall
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Lecture Hall",
    "type": "LECTURE_HALL",
    "location": "Building B",
    "capacity": 150
  }'

# Create Meeting Room
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Board Room",
    "type": "MEETING_ROOM",
    "location": "Building C",
    "capacity": 15
  }'
```

### Step 2: Verify Data in Database
```bash
# View all resources
curl http://localhost:8080/api/resources

# Filter by type
curl http://localhost:8080/api/resources?type=LAB

# Search
curl http://localhost:8080/api/resources/search?keyword=chemistry
```

### Step 3: Test Updates
```bash
# Get resource ID from list and update capacity
curl -X PATCH http://localhost:8080/api/resources/{RESOURCE_ID} \
  -H "Content-Type: application/json" \
  -d '{"capacity": 50}'
```

### Step 4: Test Status Changes
```bash
# Get resource ID and update status
curl -X PATCH "http://localhost:8080/api/resources/{RESOURCE_ID}/status?status=MAINTENANCE"
```

### Step 5: Clean Up
```bash
# Delete test resource
curl -X DELETE http://localhost:8080/api/resources/{RESOURCE_ID}
```

---

## Expected Responses

### Success Response (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Physics Lab",
  "type": "LAB",
  "location": "Building A - Room 205",
  "capacity": 30,
  "status": "ACTIVE",
  "description": "Physics laboratory",
  "createdAt": "2026-04-12T10:30:00",
  "updatedAt": "2026-04-12T10:30:00"
}
```

### Error Response (404 Not Found)
```json
{
  "error": "Resource not found with ID: invalid-id"
}
```

### Validation Error (400 Bad Request)
```json
{
  "error": "Resource name is required"
}
```

---

## Using Postman Collection

### Import Collection
1. Open Postman
2. File → Import
3. Select `SmartCampus-API.postman_collection.json`
4. Create environment with variables:
   - `base_url`: http://localhost:8080/api
   - `resource_id`: {actual-id-from-response}

### Run Requests
1. Select a request from "Resources" folder
2. Click Send
3. View response in Response panel
4. Verify status code matches expected

---

## Unit Testing

### Run All Tests
```bash
cd backend
mvn test
```

### Run ResourceService Tests Only
```bash
mvn test -Dtest=ResourceServiceTest
```

### Run Specific Test
```bash
mvn test -Dtest=ResourceServiceTest#testCreateResource_Success
```

### Generate Coverage Report
```bash
mvn test jacoco:report
open target/site/jacoco/index.html
```

### Expected Coverage
- **ResourceService**: >95%
- **ResourceRepository**: >90% (simple interface)
- **ResourceController**: >85%
- **Overall**: >85%

---

## Validation Testing

### Valid Resource Creation
✅ All required fields provided
✅ Type is valid ResourceType
✅ Capacity >= 1
✅ Status is valid ResourceStatus

### Invalid Resource Creation (should fail)
❌ No name (400)
❌ No type (400)
❌ No location (400)
❌ Capacity = 0 (400)
❌ Invalid type enum (400)

### Filtering Tests
✅ Filter by type returns only that type
✅ Filter by capacity >= minCapacity
✅ Location filter is case-insensitive
✅ Status filter returns only that status
✅ Multiple filters work together

---

## Performance Considerations

### Query Optimization
- Indexed queries: type, status, location
- Combined queries for common filters
- MongoDB $regex for search (case-insensitive)

### Response Time Goals
- GET all: <500ms
- GET by ID: <100ms
- Search: <200ms
- Create: <200ms
- Update: <200ms
- Delete: <100ms

---

## Integration Points (for other modules)

### Module B (Booking Management)
```java
// Get available resources for booking
GET /api/resources/status/ACTIVE

// Verify resource exists before booking
GET /api/resources/{resourceId}

// Check capacity constraints
GET /api/resources?minCapacity={required}
```

### Module C (Maintenance & Incidents)
```java
// Create incident for specific resource
POST /incidents with entityId = resource._id

// Update resource to maintenance
PATCH /api/resources/{id}/status?status=MAINTENANCE

// Get contact info for resource
GET /api/resources/{id} → contactPerson, phoneNumber
```

---

## Troubleshooting

### Connection Issues
**Problem:** "Connection refused"
```bash
# Check if application is running
lsof -i :8080

# Check if MongoDB is running
mongosh
```

### MongoDB Issues
**Problem:** "No suitable servers found"
```bash
# Start MongoDB
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Validation Errors
**Problem:** 400 Bad Request on create
- Ensure all required fields are provided
- Check field types match schema
- Verify enum values are correct

### Not Found Errors
**Problem:** 404 on GET /api/resources/{id}
- Verify ID format (24-char hex string for MongoDB)
- Check resource was created successfully
- Verify correct database

---

## Viva Demonstration Script

### 1. Show All Resources
```bash
curl http://localhost:8080/api/resources
```

### 2. Create New Resource
```bash
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Lab",
    "type": "LAB",
    "location": "Building Demo",
    "capacity": 30
  }'
```

### 3. Search Functionality
```bash
curl http://localhost:8080/api/resources/search?keyword=demo
```

### 4. Filter by Status
```bash
curl http://localhost:8080/api/resources/status/ACTIVE
```

### 5. Update and Show Timestamp
```bash
curl -X PATCH http://localhost:8080/api/resources/{id} \
  -H "Content-Type: application/json" \
  -d '{"capacity": 40}'

# Verify updatedAt changed
curl http://localhost:8080/api/resources/{id}
```

### 6. Delete and Verify
```bash
curl -X DELETE http://localhost:8080/api/resources/{id}

# Should return 404
curl http://localhost:8080/api/resources/{id}
```

---

**Module A Implementation - Testing Guide**
**Member 1 - Facilities & Assets Catalogue**
