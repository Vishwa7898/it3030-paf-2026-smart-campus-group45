# Development Solution: Embedded MongoDB for Testing

If you're having issues with MongoDB Atlas connection, you can use **Embedded MongoDB** for local development and testing. This requires no external MongoDB setup!

## Option 1: Add Embedded MongoDB Dependency

Edit `pom.xml` and add this dependency to use embedded MongoDB for testing:

```xml
<dependency>
    <groupId>de.flapdoodle.embed</groupId>
    <artifactId>de.flapdoodle.embed.mongo.spring30x</artifactId>
    <version>4.7.0</version>
    <scope>test</scope>
</dependency>
```

## Option 2: Quick Local MongoDB Setup (Recommended for Development)

### Using Docker (Easiest)

1. **Install Docker** from https://www.docker.com/products/docker-desktop

2. **Run MongoDB Container**
```bash
docker run --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=123 mongo:latest
```

3. **Update Connection String**
Change in `application.properties`:
```properties
spring.data.mongodb.uri=mongodb://admin:123@localhost:27017/Campus_Management?authSource=admin
```

4. **Restart Spring Boot**
```bash
mvnw.cmd spring-boot:run
```

### Without Docker (Manual Installation)

1. Download MongoDB from: https://www.mongodb.com/try/download/community
2. Install and run MongoDB server
3. Create user `admin` with password `123`
4. Create database `Campus_Management`
5. Update connection string to point to localhost

---

## Quick Testing with Sample Data

Once MongoDB is working, use these curl commands to populate sample data:

```bash
# 1. Create Equipment
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dell XPS 15 Laptop",
    "type": "EQUIPMENT",
    "location": "Computer Lab A",
    "capacity": 1,
    "status": "ACTIVE",
    "description": "High-performance laptop for design work",
    "building": "Science-Block",
    "floor": "2",
    "dailyCost": 50
  }'

# 2. Create Classroom
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CS-101 Lecture Hall",
    "type": "ROOM",
    "location": "Engineering Building",
    "capacity": 100,
    "status": "ACTIVE",
    "description": "Large lecture hall with smart board",
    "building": "Engineering-A",
    "floor": "1",
    "amenities": ["Projector", "Smart Board", "WiFi", "Mic System"]
  }'

# 3. Create Conference Room
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meeting Room - Executive",
    "type": "ROOM",
    "location": "Administrative Building",
    "capacity": 20,
    "status": "ACTIVE",
    "description": "Executive meeting room with video conference",
    "building": "Admin-Tower",
    "floor": "5",
    "amenities": ["Video Conference", "Whiteboard", "WiFi"]
  }'

# 4. Create Library Facility
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Central Library - Reading Area",
    "type": "FACILITY",
    "location": "Main Campus",
    "capacity": 150,
    "status": "ACTIVE",
    "description": "Silent reading area with study desks",
    "building": "Library-Main",
    "floor": "2",
    "amenities": ["Air Conditioning", "WiFi", "Study Desks", "Computers"]
  }'

# 5. Get all resources
curl -X GET http://localhost:8080/api/resources

# 6. Search for laptops
curl -X GET "http://localhost:8080/api/resources/search?keyword=Laptop"

# 7. Filter by location
curl -X GET "http://localhost:8080/api/resources/location/Engineering%20Building"

# 8. Get only ACTIVE resources
curl -X GET "http://localhost:8080/api/resources/status/ACTIVE"
```

---

## Docker-Compose Alternative (Complete Stack)

Create a `docker-compose.yml` in backend folder:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: campus_mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: 123
      MONGO_INITDB_DATABASE: Campus_Management
    volumes:
      - mongodb_data:/data/db

  spring-boot-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: campus_backend
    ports:
      - "8080:8080"
    depends_on:
      - mongodb
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://admin:123@mongodb:27017/Campus_Management?authSource=admin

volumes:
  mongodb_data:
```

Then run:
```bash
docker-compose up
```

---

## Verification Checklist

- [ ] MongoDB is running and accessible
- [ ] Connection string in `application.properties` is correct
- [ ] Spring Boot starts without connection errors
- [ ] `GET /api/resources` returns empty array `[]`
- [ ] `POST /api/resources` creates new resource
- [ ] Created resource appears in GET request
- [ ] Search functionality works
- [ ] Filtering by location/status works
- [ ] Update and delete operations work

---

## Troubleshooting Commands

```bash
# Check if MongoDB is running
netstat -ano | findstr :27017

# View application logs
# Keep the terminal running during mvnw.cmd spring-boot:run

# Test connection with mongo shell (if installed)
mongosh "mongodb://admin:123@localhost:27017/Campus_Management"

# Kill Spring Boot if it's hanging
taskkill /PID <PID> /F

# Test endpoint with verbose output
curl -v http://localhost:8080/api/resources
```

---

## Files to Update

If switching from MongoDB Atlas to Local MongoDB:

**`backend/src/main/resources/application.properties`**
```properties
# Clear out the Atlas URL and use:
spring.data.mongodb.uri=mongodb://admin:123@localhost:27017/Campus_Management?authSource=admin
```

---

## Performance Tips for Development

```properties
# Add to application.properties for better performance:
spring.data.mongodb.auto-index-creation=true
spring.jpa.show-sql=false
logging.level.org.springframework.data.mongodb=WARN
```

---

## Next: Production Setup

Once everything works locally:
1. Keep using MongoDB Atlas for production
2. Use environment variables for credentials
3. Enable IP whitelist in MongoDB Atlas
4. Add encryption and SSL/TLS
5. Set up backups and monitoring
