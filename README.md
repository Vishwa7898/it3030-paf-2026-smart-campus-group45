# Smart Campus Management System

A full-stack Smart Campus platform for managing facilities, maintenance requests, and incident ticket workflows.  
The system supports role-based actions for students, technicians/staff, and admins, with clear ticket lifecycle control from reporting to closure.

## Overview

This project centralizes campus operations into one application:
- Resource and facility catalog management
- Maintenance-related status handling
- Incident ticket submission, assignment, progress tracking, and closure
- Comment-based communication on tickets
- Role-aware access and workflow rules

## Key Features

- **Facilities & Assets Catalogue**
  - Create, list, search, update, and delete resources
  - Filter by type/status/capacity
  - Mark resources under maintenance
- **Incident + Ticketing Management**
  - Create tickets with priority and optional images
  - Assign technicians (admin only)
  - Enforce lifecycle transitions: `OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED`
  - Support rejection flow with reason
- **Commenting**
  - Add, edit, and delete ticket comments
  - Role-aware permission checks
- **Role-Based Behavior**
  - `USER` (student): submit and track own tickets
  - `TECHNICIAN` / `STAFF`: work only on assigned tickets
  - `ADMIN`: assign technicians, close/reject, full control

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Spring Boot, Spring Web MVC, Spring Security, Validation
- **Database:** MongoDB
- **API Testing:** Postman
- **Build Tools:** npm (frontend), Maven (backend)

## Project Structure

```text
.
|-- backend/                 # Spring Boot API
|-- frontend/                # React + Vite client
|-- postman/                 # Exported Postman collection/environment
|-- uploads/                 # Uploaded ticket images (runtime/local)
```

## Prerequisites

- Java 21
- Maven 3.9+
- Node.js 20+ and npm
- MongoDB (local or Atlas)
- Postman Desktop (recommended)

## Environment Configuration

Create/update backend configuration in `backend/src/main/resources/application.properties`.

Suggested values:

```properties
server.port=8080
app.frontend-url=${FRONTEND_URL:http://localhost:5173}

# Database (prefer environment substitution in real deployment)
spring.data.mongodb.uri=${MONGODB_URI}

# Optional upload directory for ticket images
app.upload.dir=uploads
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

For production/shared environments:
- Do not commit secrets in source control
- Store OAuth and DB credentials in environment variables or secret manager

## Installation & Run

### 1) Clone repository

```bash
git clone <your-repo-url>
cd it3030-paf-2026-smart-campus-group45
```

### 2) Run backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

### 3) Run frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## API Modules

- **Health**
  - `GET /api/health`
- **Resources**
  - `POST /api/resources`
  - `GET /api/resources`
  - `GET /api/resources/{id}`
  - `PATCH /api/resources/{id}`
  - `PATCH /api/resources/{id}/status`
  - `DELETE /api/resources/{id}`
- **Tickets**
  - `POST /api/tickets`
  - `GET /api/tickets`
  - `GET /api/tickets/{id}`
  - `PUT /api/tickets/{id}`
  - `PUT /api/tickets/{id}/assign`
  - `PUT /api/tickets/{id}/status`
  - `DELETE /api/tickets/{id}`
- **Ticket Comments**
  - `POST /api/tickets/{ticketId}/comments`
  - `GET /api/tickets/{ticketId}/comments`
  - `PUT /api/tickets/{ticketId}/comments/{commentId}`
  - `DELETE /api/tickets/{ticketId}/comments/{commentId}`

## Postman Testing Guide

Import these files:
- `postman/Facilities_Assets_Catalogue.postman_collection.json`
- `postman/Facilities_Assets_Catalogue.postman_environment.json`

Select environment: **Local Backend - Smart Campus**

### Recommended test flow

1. Health check (`200`)
2. Create resource (`201`) -> save `resourceId`
3. Set resource status to maintenance (`200`)
4. Create ticket (`201`) -> save `ticketId`
5. Assign technician (`200`)
6. Move status:
   - `OPEN -> IN_PROGRESS` (`200`)
   - `IN_PROGRESS -> RESOLVED` (`200`)
   - `RESOLVED -> CLOSED` (`200`)
7. Add/list/update/delete comments (`201/200/200/204`)
8. Run negative tests (`400/403/404/409`)

### Expected status codes

- Success: `200`, `201`, `204`
- Validation/logic errors: `400`
- Unauthorized/forbidden: `401`, `403`
- Not found: `404`
- Conflict/duplicate: `409`

## Core Business Rules

- Only admins can assign technicians.
- Only assigned technician/staff can move `OPEN -> IN_PROGRESS` and `IN_PROGRESS -> RESOLVED`.
- `RESOLVED -> CLOSED` is admin-only.
- Rejection requires admin role and a reason.
- Students can only view/comment on their own tickets.
- Ticket details are editable only while status is `OPEN`.


## Conclusion

The Smart Campus Management System meets its core objective of digitizing campus facility operations through a unified platform.  
By combining resource management, maintenance handling, and incident ticket workflows with role-based controls, the project improves transparency, response coordination, and service quality.  
It also establishes a scalable foundation for future enhancements such as analytics, automation, and predictive maintenance.
