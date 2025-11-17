# Backend Architecture - Gig Economy Platform

## Overview

This document outlines the backend architecture for the Gig Economy platform - a self-hostable application for groups of friends to propose, discover, and express interest in gigs and festivals.

**Technology Stack:**
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod
- **API Type:** RESTful API

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Frontend                          │
│                    (Port 3000 - Development)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express.js Backend                         │
│                    (Port 5000 - Development)                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ API Layer                                                 │  │
│  │  - Routes (Express Router)                                │  │
│  │  - Controllers (Business Logic)                           │  │
│  │  - Middleware (Auth, Validation, Error Handling)          │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Service Layer                                             │  │
│  │  - Business Logic Services                                │  │
│  │  - Data Transformation                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Data Access Layer (Prisma)                                │  │
│  │  - Prisma Client                                          │  │
│  │  - Database Queries                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ Prisma ORM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                        │
│                         (Port 5432)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Design

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│     User     │         │     Gig      │         │   Interest   │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │────┐    │ id (PK)      │    ┌────│ id (PK)      │
│ email        │    │    │ artist       │    │    │ gigId (FK)   │
│ name         │    │    │ date         │    │    │ userId (FK)  │
│ password     │    │    │ day          │    │    │ interestLevel│
│ role         │    │    │ venue        │    │    │ createdAt    │
│ createdAt    │    │    │ location     │    │    │ updatedAt    │
│ updatedAt    │    │    │ addedById(FK)│◄───┘    └──────────────┘
└──────────────┘    │    │ createdAt    │              ▲
                    │    │ updatedAt    │              │
                    │    └──────────────┘              │
                    │            │                     │
                    │            │ 1:N                 │
                    │            ▼                     │
                    │    ┌──────────────┐              │
                    │    │  GigType     │              │
                    │    ├──────────────┤              │
                    └───►│ id (PK)      │              │
                         │ gigId (FK)   │              │
                         │ type         │──────────────┘
                         └──────────────┘
```

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum InterestLevel {
  INTERESTED
  VERY_INTERESTED
  GOING
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String   // Hashed with bcrypt
  initials  String?  @db.VarChar(3)
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  gigsAdded  Gig[]       @relation("AddedBy")
  interests  Interest[]

  @@index([email])
  @@map("users")
}

model Gig {
  id        String   @id @default(cuid())
  artist    String
  date      DateTime
  day       String   // e.g., "Saturday"
  venue     String
  location  String
  addedById String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  addedBy   User?      @relation("AddedBy", fields: [addedById], references: [id], onDelete: SetNull)
  types     GigType[]
  interests Interest[]

  @@index([date])
  @@index([artist])
  @@index([location])
  @@map("gigs")
}

model GigType {
  id    String @id @default(cuid())
  gigId String
  type  String // e.g., "Club", "Festival", "Concert", "Rave"

  // Relations
  gig Gig @relation(fields: [gigId], references: [id], onDelete: Cascade)

  @@index([gigId])
  @@map("gig_types")
}

model Interest {
  id             String         @id @default(cuid())
  gigId          String
  userId         String
  interestLevel  InterestLevel  @default(INTERESTED)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  // Relations
  gig  Gig  @relation(fields: [gigId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([gigId, userId]) // A user can only have one interest per gig
  @@index([gigId])
  @@index([userId])
  @@map("interests")
}
```

---

## Directory Structure

```
gig-economy/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js           # Prisma client initialization
│   │   │   └── env.js                # Environment configuration
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Authentication logic
│   │   │   ├── gig.controller.js     # Gig CRUD operations
│   │   │   ├── user.controller.js    # User management
│   │   │   └── interest.controller.js# Interest tracking
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT verification
│   │   │   ├── validate.middleware.js# Request validation
│   │   │   ├── error.middleware.js   # Error handling
│   │   │   └── cors.middleware.js    # CORS configuration
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # /api/auth/*
│   │   │   ├── gig.routes.js         # /api/gigs/*
│   │   │   ├── user.routes.js        # /api/users/*
│   │   │   └── index.js              # Route aggregator
│   │   ├── services/
│   │   │   ├── auth.service.js       # Authentication business logic
│   │   │   ├── gig.service.js        # Gig business logic
│   │   │   ├── user.service.js       # User business logic
│   │   │   └── interest.service.js   # Interest business logic
│   │   ├── utils/
│   │   │   ├── jwt.js                # JWT utilities
│   │   │   ├── password.js           # Password hashing utilities
│   │   │   └── validators.js         # Zod schemas
│   │   ├── types/
│   │   │   └── index.d.ts            # TypeScript type definitions
│   │   ├── app.js                    # Express app setup
│   │   └── server.js                 # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema
│   │   ├── migrations/               # Migration files
│   │   └── seed.js                   # Database seeding script
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── setup.js
│   ├── .env.example                  # Environment variables template
│   ├── .env                          # Environment variables (gitignored)
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
├── frontend/
│   └── ... (existing React app)
├── docker-compose.yml                # Docker setup for PostgreSQL
└── BACKEND.md                        # This document
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint            | Description                | Auth Required |
|--------|---------------------|----------------------------|---------------|
| POST   | /api/auth/register  | Register new user          | No            |
| POST   | /api/auth/login     | Login user                 | No            |
| POST   | /api/auth/refresh   | Refresh access token       | No            |
| GET    | /api/auth/me        | Get current user           | Yes           |
| POST   | /api/auth/logout    | Logout user                | Yes           |

### User Endpoints

| Method | Endpoint              | Description                | Auth Required |
|--------|-----------------------|----------------------------|---------------|
| GET    | /api/users            | Get all users              | Yes (Admin)   |
| GET    | /api/users/:id        | Get user by ID             | Yes           |
| PATCH  | /api/users/:id        | Update user                | Yes (Own)     |
| DELETE | /api/users/:id        | Delete user                | Yes (Admin)   |

### Gig Endpoints

| Method | Endpoint              | Description                | Auth Required |
|--------|-----------------------|----------------------------|---------------|
| GET    | /api/gigs             | Get all gigs (w/ filters)  | No*           |
| GET    | /api/gigs/:id         | Get gig by ID              | No*           |
| POST   | /api/gigs             | Create new gig             | Yes           |
| PATCH  | /api/gigs/:id         | Update gig                 | Yes (Owner)   |
| DELETE | /api/gigs/:id         | Delete gig                 | Yes (Owner)   |

*Can be configured to require authentication

### Interest Endpoints

| Method | Endpoint                    | Description                | Auth Required |
|--------|--------------------------------|----------------------------|---------------|
| POST   | /api/gigs/:id/interest         | Express interest in gig    | Yes           |
| DELETE | /api/gigs/:id/interest         | Remove interest in gig     | Yes           |
| GET    | /api/gigs/:id/interested       | Get users interested       | No            |
| GET    | /api/users/:id/interests       | Get user's interests       | Yes           |

### Query Parameters for GET /api/gigs

```javascript
{
  search: string,           // Search by artist, venue, location
  dateFrom: ISO8601,        // Filter by date range start
  dateTo: ISO8601,          // Filter by date range end
  location: string,         // Filter by location
  type: string[],           // Filter by gig types
  weekendOnly: boolean,     // Show only weekend gigs
  sort: string,             // Sort field (date, artist, venue)
  order: 'asc' | 'desc',    // Sort order
  page: number,             // Pagination page
  limit: number             // Items per page
}
```

---

## Authentication & Authorization

### JWT Strategy

**Access Token:**
- Expires in: 15 minutes
- Contains: userId, email, role
- Stored in: HTTP-only cookie or Authorization header

**Refresh Token:**
- Expires in: 7 days
- Contains: userId
- Stored in: HTTP-only cookie
- Used to: Issue new access tokens

### Password Security

- **Hashing Algorithm:** bcrypt with salt rounds = 12
- **Validation Rules:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Role-Based Access Control (RBAC)

**Roles:**
- `USER`: Can create gigs, express interest, edit own profile
- `ADMIN`: All USER permissions + manage all gigs and users

**Middleware Chain:**
```javascript
router.delete('/gigs/:id',
  authenticate,           // Verify JWT token
  authorize(['ADMIN']),   // Check role
  gigController.delete    // Execute controller
);
```

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/gigeconomy"

# Server
NODE_ENV="development"  # development | production | test
PORT=5000
API_PREFIX="/api"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3000"  # Frontend URL

# Bcrypt
BCRYPT_ROUNDS=12
```

---

## Database Migrations

### Initial Setup

```bash
# Initialize Prisma
npx prisma init

# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed database with sample data
npm run seed
```

### Migration Workflow

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name <migration_name>

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Codes

| Code                  | HTTP Status | Description                    |
|-----------------------|-------------|--------------------------------|
| VALIDATION_ERROR      | 400         | Request validation failed      |
| UNAUTHORIZED          | 401         | Authentication required        |
| FORBIDDEN             | 403         | Insufficient permissions       |
| NOT_FOUND             | 404         | Resource not found             |
| CONFLICT              | 409         | Resource already exists        |
| INTERNAL_SERVER_ERROR | 500         | Unexpected server error        |
| DATABASE_ERROR        | 500         | Database operation failed      |

---

## Data Migration from JSON

### Migration Script

A migration script will be created to import existing data from `frontend/db.json` into PostgreSQL:

```bash
npm run migrate:json
```

**Process:**
1. Read `db.json`
2. Create default users for each unique "added.name"
3. Create gigs with proper relations
4. Create gig types
5. Create interest records
6. Log migration results

---

## Performance Considerations

### Database Indexing

Indexes are defined in the Prisma schema for:
- `User.email` (unique + indexed)
- `Gig.date` (frequently queried)
- `Gig.artist` (search functionality)
- `Gig.location` (filtering)
- `Interest.gigId` and `Interest.userId` (relations)

### Query Optimization

- Use Prisma's `select` to fetch only needed fields
- Implement pagination for list endpoints (default 20 items)
- Use `include` strategically to avoid N+1 queries
- Cache frequently accessed data (e.g., user sessions)

### Connection Pooling

Prisma manages connection pooling automatically. Configure in `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10  // Adjust based on deployment
}
```

---

## Deployment Considerations

### Docker Setup

A `docker-compose.yml` file will be provided for local development:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: gigeconomy
      POSTGRES_PASSWORD: localdevpassword
      POSTGRES_DB: gigeconomy
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Production Checklist

- [ ] Use environment-specific `.env` files
- [ ] Enable HTTPS/TLS
- [ ] Set secure JWT secrets (32+ characters)
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Enable query logging for debugging
- [ ] Use a process manager (PM2, systemd)
- [ ] Set up monitoring and alerting
- [ ] Configure rate limiting
- [ ] Enable database SSL connections
- [ ] Review and harden security headers

---

## Testing Strategy

### Unit Tests
- Service layer business logic
- Utility functions (JWT, password hashing)
- Validation schemas

### Integration Tests
- API endpoints
- Database operations via Prisma
- Authentication flows

### Test Database
Use a separate test database:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/gigeconomy_test"
```

---

## Development Workflow

### Initial Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Start PostgreSQL (via Docker)
docker-compose up -d

# 5. Run migrations
npx prisma migrate dev

# 6. Seed database (optional)
npm run seed

# 7. Start development server
npm run dev
```

### Daily Development

```bash
# Start the backend server
npm run dev

# Start the frontend (in another terminal)
cd ../frontend && npm start

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## Security Best Practices

1. **Input Validation:** All inputs validated using Zod schemas
2. **SQL Injection:** Prevented by Prisma's parameterized queries
3. **XSS Protection:** Sanitize user inputs, use Content Security Policy
4. **CSRF Protection:** Use CSRF tokens for state-changing operations
5. **Rate Limiting:** Implement rate limiting on authentication endpoints
6. **Helmet.js:** Security headers middleware
7. **Dependency Scanning:** Regular `npm audit` and updates
8. **Secrets Management:** Never commit `.env` files
9. **HTTPS Only:** In production, enforce HTTPS
10. **Audit Logging:** Log authentication events and sensitive operations

---

## Future Enhancements

### Phase 2 Features
- [ ] Email notifications for new gigs
- [ ] Social features (comments, ratings)
- [ ] Calendar integration (iCal export)
- [ ] Ticket purchase links
- [ ] Image uploads for gigs
- [ ] User profiles with avatars
- [ ] Friend/group management
- [ ] Real-time updates via WebSockets

### Phase 3 Features
- [ ] Mobile app (React Native)
- [ ] Recommendation engine
- [ ] Integration with Spotify/Last.fm
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode API preferences

---

## License & Contact

This is a self-hosted, open-source project for private use among friends.

For questions or contributions, please refer to the main README.md.

---

**Last Updated:** 2025-11-17
**Version:** 1.0.0
**Author:** Backend Architecture Team
