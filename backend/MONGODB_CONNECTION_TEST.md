# MongoDB Connection Testing & Troubleshooting Guide

## Current Status

✅ **Completed:**
- Maven project builds successfully
- Spring Boot application starts on port 8080
- MongoDB dependency is correctly configured (`spring-boot-starter-data-mongodb`)
- Resource model has `@Document` annotation for MongoDB mapping
- ResourceRepository extends `MongoRepository`
- SecurityConfig allows `/api/resources/**` endpoints

⚠️ **Issue Identified:**
- API requests timeout (5+ seconds hang) when accessing `/api/resources`
- This indicates MongoDB connection is not responding or hanging during connection

## MongoDB Connection Configuration

**Current URL:** `mongodb+srv://admin:123@cluster0.mitomzn.mongodb.net/Campus_Management`

### Potential Issues & Solutions

#### 1. **MongoDB Atlas Credentials**
- Verify username `admin` and password `123` are correct
- Log into MongoDB Atlas and check if credentials match
- Ensure the user has access to the cluster

#### 2. **IP Whitelist (Security)**
MongoDB Atlas requires IP whitelisting:
- Go to MongoDB Atlas Dashboard → Network Access
- Add your IP address (or 0.0.0.0/0 for development only)
- Current machine IP needs to be whitelisted

#### 3. **Network Connectivity**
- Verify internet connection can reach MongoDB Atlas
- Check firewall settings aren't blocking MongoDB connection (port 27017)
- Try: `ping cluster0.mitomzn.mongodb.net`

#### 4. **Connection String Issues**
- Ensure username and password don't have special characters that need URL encoding
- Verify database name `Campus_Management` exists
- Check cluster name `cluster0.mitomzn` is correct

#### 5. **Driver Compatibility**
- Spring Boot 4.0.5 with MongoDB driver should be compatible
- May need to add connection timeout parameters

## Recommended Solutions

### Option A: Add Connection Timeout Parameters
Add to `application.properties`:
```properties
spring.data.mongodb.uri=mongodb+srv://admin:123@cluster0.mitomzn.mongodb.net/Campus_Management?serverSelectionTimeoutMS=5000&socketTimeoutMS=5000&connectTimeoutMS=5000
```

### Option B: Use Environment Variables (Recommended for Security)
```properties
spring.data.mongodb.uri=${MONGODB_URI:mongodb+srv://admin:123@cluster0.mitomzn.mongodb.net/Campus_Management}
```

Then set environment variable `MONGODB_URI`

### Option C: Component-Based Configuration
```properties
spring.data.mongodb.host=cluster0.mitomzn.mongodb.net
spring.data.mongodb.port=27017
spring.data.mongodb.database=Campus_Management
spring.data.mongodb.username=admin
spring.data.mongodb.password=123
spring.data.mongodb.authentication-database=admin
```

## Testing Steps

### Step 1: Verify Spring Boot Starts
```bash
mvnw.cmd spring-boot:run
# Check for errors in console logs
```

### Step 2: Test API Endpoint
```bash
curl -v http://localhost:8080/api/resources
# Should respond with 200 and JSON array
```

### Step 3: Create Test Resource
```bash
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conference Room A",
    "type": "ROOM",
    "location": "Building 1",
    "capacity": 50,
    "status": "ACTIVE"
  }'
```

## Next Steps

1. ✅ Verify MongoDB Atlas credentials are correct
2. ✅ Whitelist your IP in MongoDB Atlas
3. ✅ Add timeout parameters to connection string
4. ✅ Restart application and test endpoints
5. ✅ Verify security configuration is working

## Files Modified

- [backend/src/main/resources/application.properties](../backend/src/main/resources/application.properties) - Added logging and MongoDB configuration

## Status after fixing

Once MongoDB connection is established:
- [ ] Test GET all resources
- [ ] Test POST /create resource
- [ ] Test PUT /update resource
- [ ] Test DELETE /remove resource
- [ ] Verify security authentication works
- [ ] Test filtering endpoints (by type, location, capacity, status)
