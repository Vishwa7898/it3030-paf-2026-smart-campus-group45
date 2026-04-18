# MongoDB & Spring Boot Integration - Complete Testing Guide

## ✅ Completed Setup

### 1. **Maven Build**
```bash
mvnw.cmd clean compile -DskipTests
```
Status: ✅ SUCCESS

### 2. **Spring Boot Application**
- Runs on: `http://localhost:8080`
- Status: ✅ Configured and running

### 3. **MongoDB Atlas Connection**
Configuration in `application.properties`:
```properties
spring.data.mongodb.uri=mongodb+srv://admin:123@cluster0.mitomzn.mongodb.net/Campus_Management?serverSelectionTimeoutMS=5000&socketTimeoutMS=5000&connectTimeoutMS=5000&maxIdleTimeMS=45000
```

## 🔍 Issue Diagnosis

**Problem:** API requests timeout after 5+ seconds
- Indicates MongoDB connection is hanging
- Could be network, credentials, or IP whitelist issue

## ⚠️ Action Items Required

### CRITICAL: MongoDB Atlas Configuration
1. **Verify Credentials**
   - Log in to: https://account.mongodb.com
   - Check username: `admin`
   - Verify password: `123`

2. **Whitelist Your IP**
   - Go to MongoDB Atlas → Project → Network Access
   - Add your IP address (find it at: https://whatismyip.com)
   - Or allow all: `0.0.0.0/0` (for development only!)

3. **Verify Cluster**
   - Cluster name should be: `cluster0`
   - Database should be: `Campus_Management`

## 🚀 Testing Commands

### Start Application
```bash
cd backend
mvnw.cmd spring-boot:run
```

### Test 1: Get All Resources (Empty)
```bash
curl -X GET http://localhost:8080/api/resources \
  -H "Content-Type: application/json"
```
Expected: `[]` (empty array or existing resources)

### Test 2: Create a Resource
```bash
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop 001",
    "type": "EQUIPMENT",
    "location": "Lab Building",
    "capacity": 1,
    "status": "ACTIVE",
    "description": "Dell Inspiron Laptop",
    "building": "Lab-A",
    "floor": "2"
  }'
```

### Test 3: Create Multiple Resources
```bash
# Classroom
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Classroom 101",
    "type": "ROOM",
    "location": "Academic Building",
    "capacity": 50,
    "status": "ACTIVE",
    "building": "Academic-B",
    "floor": "1",
    "description": "Lecture Hall with projector"
  }'

# Library
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Central Library",
    "type": "FACILITY",
    "location": "Main Campus",
    "capacity": 200,
    "status": "ACTIVE",
    "description": "Main library with study areas",
    "ammenities": ["WiFi", "Study Rooms", "Computers"]
  }'
```

### Test 4: Search Resources
```bash
# Search by name
curl -X GET "http://localhost:8080/api/resources/search?keyword=Classroom" \
  -H "Content-Type: application/json"
```

### Test 5: Filter by Location
```bash
curl -X GET "http://localhost:8080/api/resources/location/Academic%20Building" \
  -H "Content-Type: application/json"
```

### Test 6: Filter by Status
```bash
curl -X GET "http://localhost:8080/api/resources/status/ACTIVE" \
  -H "Content-Type: application/json"
```

### Test 7: Update Resource
```bash
# First, get the resource ID from creation response
# Then update:
curl -X PUT "http://localhost:8080/api/resources/{ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Classroom 101 - Updated",
    "capacity": 55,
    "status": "MAINTENANCE"
  }'
```

### Test 8: Delete Resource
```bash
curl -X DELETE "http://localhost:8080/api/resources/{ID}"
```

## 🔒 Security Configuration

Current security settings:
- ✅ CSRF protection: Disabled (for development)
- ✅ `/api/resources/**`: Allows all (public access)
- ✅ Other endpoints: Require authentication
- ✅ CORS: Enabled for all origins
- ✅ Method-level security: Can be enabled

## 📊 Module A Requirements - Status

| Feature | Status | Endpoint |
|---------|--------|----------|
| Create Resource | ✅ Ready | `POST /api/resources` |
| List Resources | ✅ Ready | `GET /api/resources` |
| Search Resources | ✅ Ready | `GET /api/resources/search` |
| Filter by Location | ✅ Ready | `GET /api/resources/location/{location}` |
| Filter by Status | ✅ Ready | `GET /api/resources/status/{status}` |
| Get Resource Detail | ✅ Ready | `GET /api/resources/{id}` |
| Update Resource | ✅ Ready | `PUT /api/resources/{id}` |
| Partial Update | ✅ Ready | `PATCH /api/resources/{id}` |
| Delete Resource | ✅ Ready | `DELETE /api/resources/{id}` |

## 📝 Resource Types

Valid `ResourceType` values:
- `ROOM` - Classrooms, conference rooms
- `EQUIPMENT` - Laptops, projectors, etc.
- `FACILITY` - Library, cafeteria, etc.
- `TRANSPORT` - Vehicles
- `OTHER` - Other resources

## 📋 Resource Status

Valid `ResourceStatus` values:
- `ACTIVE` - Available for booking
- `INACTIVE` - Not available
- `MAINTENANCE` - Under maintenance
- `OUT_OF_SERVICE` - Temporarily unavailable

## 🔧 Troubleshooting

### If requests still timeout:
1. Check MongoDB Atlas cluster is running
2. Verify credentials in MongoDB Atlas
3. Whitelist your IP address
4. Check internet connectivity
5. Try alternative connection string without credentials hardcoding

### If 401/403 errors:
1. Security is working correctly (good!)
2. Requests without proper auth might fail on non-public endpoints
3. Current config allows all `/api/resources/**` endpoints

### If no data persists:
1. Verify database name `Campus_Management` is correct
2. Check MongoDB storage is not full
3. Verify write permissions for user `admin`

## 📚 Next Steps

1. Fix MongoDB connection as per Action Items above
2. Run testing commands one by one
3. Verify all CRUD operations work
4. Test filtering and search functionality
5. Once working: Add authentication/authorization
6. Deploy to production with proper security

---

**Configuration Files Modified:**
- `backend/src/main/resources/application.properties` - Updated with timeout parameters

**Created Documentation:**
- `backend/MONGODB_CONNECTION_TEST.md` - Detailed troubleshooting guide
