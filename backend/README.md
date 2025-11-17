# Gig Economy Backend

A robust RESTful API backend for the Gig Economy platform, built with Node.js, Express, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod
- **Security:** Helmet, bcrypt, CORS

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (or use Docker)
- Git

### Installation

1. **Clone the repository** (if not already done)

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and JWT secrets.

5. **Start PostgreSQL** (using Docker)
   ```bash
   cd ..
   docker-compose up -d
   cd backend
   ```

6. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

7. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

8. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

9. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## Database Migration from JSON

If you have existing data in `frontend/db.json`, you can migrate it to PostgreSQL:

```bash
npm run migrate:json
```

This will:
- Create users from the "added" and "interested" fields
- Import all gigs with their types
- Preserve interest relationships
- Default password for all users: `GigEconomy2024!`

## API Endpoints

### Authentication

| Method | Endpoint            | Description        | Auth Required |
|--------|---------------------|--------------------|---------------|
| POST   | /api/auth/register  | Register new user  | No            |
| POST   | /api/auth/login     | Login user         | No            |
| POST   | /api/auth/refresh   | Refresh token      | No            |
| GET    | /api/auth/me        | Get current user   | Yes           |
| POST   | /api/auth/logout    | Logout user        | Yes           |

### Gigs

| Method | Endpoint          | Description                | Auth Required |
|--------|-------------------|----------------------------|---------------|
| GET    | /api/gigs         | Get all gigs (w/ filters)  | Optional      |
| GET    | /api/gigs/:id     | Get gig by ID              | Optional      |
| POST   | /api/gigs         | Create new gig             | Yes           |
| PATCH  | /api/gigs/:id     | Update gig                 | Yes (Owner)   |
| DELETE | /api/gigs/:id     | Delete gig                 | Yes (Owner)   |

### Interest Tracking

| Method | Endpoint                  | Description             | Auth Required |
|--------|---------------------------|-------------------------|---------------|
| POST   | /api/gigs/:id/interest    | Express interest        | Yes           |
| DELETE | /api/gigs/:id/interest    | Remove interest         | Yes           |
| GET    | /api/gigs/:id/interested  | Get interested users    | Optional      |
| GET    | /api/users/:id/interests  | Get user's interests    | Yes           |

### Query Parameters for GET /api/gigs

```
?search=artist_name          # Search by artist, venue, or location
&dateFrom=2025-01-01         # Filter by start date
&dateTo=2025-12-31           # Filter by end date
&location=London             # Filter by location
&type=Festival,Concert       # Filter by types
&weekendOnly=true            # Show only weekend gigs
&sort=date                   # Sort by: date, artist, venue, location
&order=asc                   # Order: asc or desc
&page=1                      # Page number
&limit=20                    # Items per page
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://gigeconomy:localdevpassword@localhost:5432/gigeconomy"

# Server
NODE_ENV="development"
PORT=5000
API_PREFIX="/api"

# JWT Secrets (change these!)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Bcrypt
BCRYPT_ROUNDS=12
```

## NPM Scripts

```bash
npm run dev           # Start development server with nodemon
npm start             # Start production server
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Create and run migration
npm run prisma:deploy     # Deploy migrations to production
npm run prisma:studio     # Open Prisma Studio (GUI)
npm run prisma:reset      # Reset database (WARNING: deletes data)
npm run seed              # Seed database with sample data
npm run migrate:json      # Migrate data from db.json
npm test                  # Run tests
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

## Development Workflow

1. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

2. **Run migrations** (if schema changed)
   ```bash
   npx prisma migrate dev --name description_of_changes
   ```

3. **Start backend server**
   ```bash
   npm run dev
   ```

4. **Start frontend** (in another terminal)
   ```bash
   cd ../frontend
   npm start
   ```

5. **Test API** using:
   - Browser: http://localhost:5000/api/health
   - Postman or similar API client
   - Frontend application

## Authentication Flow

1. **Register**: POST to `/api/auth/register` with email, name, password
2. **Login**: POST to `/api/auth/login` with email, password
3. **Receive Tokens**:
   - `accessToken` (15 min) - Include in `Authorization: Bearer <token>` header
   - `refreshToken` (7 days) - Stored in HTTP-only cookie
4. **Use Access Token**: Include in Authorization header for protected routes
5. **Refresh**: POST to `/api/auth/refresh` when access token expires
6. **Logout**: POST to `/api/auth/logout` to clear tokens

## Database Schema

See the full schema in `prisma/schema.prisma`:

- **User**: Stores user accounts with email, password (hashed), name, role
- **Gig**: Event/gig information with artist, date, venue, location
- **GigType**: Many-to-many relationship for gig types (Festival, Concert, etc.)
- **Interest**: Tracks which users are interested in which gigs

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT-based authentication
- HTTP-only cookies for refresh tokens
- CORS configuration
- Helmet security headers
- Input validation with Zod
- SQL injection protection (Prisma)
- Rate limiting (to be implemented)

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [] // Optional additional details
  }
}
```

## Prisma Studio

To visually explore and edit your database:

```bash
npx prisma studio
```

Opens at http://localhost:5555

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
```

## Production Deployment

1. Set environment variables in production
2. Use strong JWT secrets (32+ characters)
3. Set `NODE_ENV=production`
4. Use HTTPS/TLS
5. Run migrations: `npx prisma migrate deploy`
6. Use a process manager (PM2, systemd)
7. Set up database backups
8. Configure rate limiting
9. Enable monitoring and logging

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Migration files
│   └── seed.js          # Seed script
├── scripts/
│   └── migrate-from-json.js  # JSON migration script
├── tests/               # Test files
├── .env                 # Environment variables (gitignored)
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md            # This file
```

## Troubleshooting

### Database connection failed

- Check PostgreSQL is running: `docker ps`
- Verify DATABASE_URL in `.env`
- Check database credentials

### Prisma errors

- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate reset` to reset (WARNING: deletes data)

### Port already in use

- Change PORT in `.env`
- Or kill the process using port 5000

### JWT errors

- Check JWT secrets are set in `.env`
- Ensure secrets are at least 32 characters in production

## Documentation

For full architecture documentation, see `/BACKEND.md` in the project root.

## License

MIT

## Support

For issues or questions, please create an issue in the GitHub repository.
