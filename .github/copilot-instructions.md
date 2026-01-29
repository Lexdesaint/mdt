# AI Coding Agent Instructions for MDT

## Project Overview
MDT is a TypeScript-based Node.js/Express REST API for a task management application with PostgreSQL database. It emphasizes structured logging, security middleware, and clean separation between routes, services, and database layers via Prisma ORM.

**Key Stack:** Node.js 18.x, Express 5.1, TypeScript, Prisma 6.15, PostgreSQL, JWT auth, Joi validation

---

## Architecture & Component Patterns

### Data & Database Layer
- **Prisma ORM** (`src/config/database/prisma.ts`): Primary data access layer; generated client lives in `src/generated/prisma/`
- **Schema** (`prisma/schema.prisma`): PostgreSQL schema with models: `User`, `Project`, `ProjectMember`, `Task`, `Comment`, `Token`, etc.
- **Migrations**: Stored in `prisma/migrations/` with auto-generated SQL
- **Command pattern**: `npm run update:prisma_DB` generates migrations AND updates Prisma client in one step
- **Key pattern**: All database queries must use the imported `prisma` singleton from config, not local imports

### API Structure (Modular by Feature)
```
src/api/
├── auth/               # Authentication endpoints
│   ├── controller.ts   # HTTP handlers
│   ├── route.ts        # Express Router definitions
│   ├── service.ts      # Business logic (currently commented out)
│   └── validator.ts    # Joi validation schemas
├── logger/             # System & request logging endpoints
└── peso/               # (placeholder for future module)
```
**Convention:** Each module has controller → route → service → validator layer separation. Services contain business logic; controllers handle HTTP concerns.

### Middleware Stack & Order
Registered in `src/routes/routeConfig.ts`:
1. **Logger middleware** (request/response logging via `Logger` singleton)
2. **Rate limiter** (express-rate-limit configured in `src/config/rateLimiter.ts`)
3. **Content-type validation** (rejects invalid MIME types)
4. **Body size limit** (prevents oversized payloads)
5. **URL-encoded parser** (multer alternative)
6. **Body parsing error handler**
7. **Body validation middleware** (Joi schema validation)

**Auth middleware** (`src/middleware/auth/authMiddleware.ts`): Validates JWT tokens and checks token existence in DB (tokens tracked in `Token` table).

### Response & Logging Format
- **Response formatter** (`src/type/response.ts`): Standardized format with `status`, `message`, `code`, `body`, `timestamp`, `systemIp`, `requestId`
- **Logger singleton** (`src/api/logger/controller.ts`): Request/response middleware captures method, URL, status, IP, user agent, timing, optional bodies
- **Error handler** (`src/middleware/errorHandler.ts`): Global catch-all; logs via Logger, returns formatted error with stack in dev only

---

## Development Workflows

### Setup & Build
```bash
npm install                          # Install dependencies
npm run dev                          # Watch mode with ts-node-dev (runs seed first)
npm run build                        # Compile TS, copy dist/generated, regenerate Prisma
npm run start                        # Run compiled dist/index.js on port from env
```

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run: `npm run update:prisma_DB` ← Creates migration AND regenerates Prisma client
3. Prisma client auto-updates in `src/generated/prisma/`

### Environment Setup
- Copy `env copy.example` to `.env` 
- Required vars: `DATABASE_URL` (or `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
- JWT vars: `JWT_SECRET`, `JWT_EXPIRATION`, `FRONTEND_URL`
- Server port via `SERVER_PORT` env var

---

## Key Code Patterns & Conventions

### Validation
- **Use Joi** for input validation (e.g., `src/api/auth/validator.ts`)
- Schemas define pattern, min/max lengths, custom messages
- Applied via `bodyValidationMiddleware` in route stack

### Authentication & Authorization
- **JWT tokens** stored in Prisma `Token` model with `is_used` and `expires_at` tracking
- **Role-based middleware** available: `isAdmin`, `isSuperAdmin`, `requireRoles` (in `src/middleware/auth/`)
- Example: `requireRoles(['admin'])` middleware guards endpoints

### Error Handling
- Throw errors with `.status` or `.statusCode` property for HTTP status
- `globalErrorHandler` middleware catches and formats them
- Always check `Logger.getInstance()` for logging errors with requestId

### Request/Response ID Tracking
- `requestId` auto-generated, stored in `res.locals.requestId`
- Used by logger and error handler for tracing
- Included in all responses for debugging

### Singleton Pattern
- **Logger** and **RateLimiter**: Implemented as singletons for consistent instance management
- Access via `.getInstance()` method
- Prevents re-initialization and state conflicts

### Security Middleware Details
- **SQL injection detector** (`enhancedSqlInjectionDetector`): Scans request bodies for suspicious patterns
- **Rate limiting**: Configured per endpoint capability in `src/config/rateLimiter.ts`
- **Helmet.js**: Sets secure HTTP headers automatically
- **CORS**: Enabled with `cors()` middleware

---

## File Conventions & Locations

| Component | Location |
|-----------|----------|
| Environment config parsing | `src/config/env.ts` |
| Database connection & Prisma setup | `src/config/database/prisma.ts`, `database.ts` |
| Swagger/OpenAPI docs | `src/config/swagger.ts` (auto-scans JSDoc in route files) |
| Custom types/interfaces | `src/type/` (authTypes, request, response, database) |
| Utility functions | `src/utils/` (systemInfo, routeSync) |
| Global middleware setup | `src/routes/routeConfig.ts` |
| Routes registry | `src/routes/route.ts` |

---

## Common Tasks

### Add a New API Endpoint
1. Create feature folder under `src/api/` (e.g., `tasks/`)
2. Create: `controller.ts`, `route.ts`, `service.ts`, `validator.ts`
3. Define Joi schema in `validator.ts`
4. Implement controller (parse input, call service, format response)
5. Register in `src/routes/route.ts` with path and required middlewares
6. If auth required: add `authMiddleware` to middleware array

### Add Database Model
1. Add model to `prisma/schema.prisma`
2. Run: `npm run update:prisma_DB`
3. Use in services: `import { prisma } from '../config/database/prisma'`

### Log Information
```typescript
import { Logger } from '../api/logger/controller';
const logger = Logger.getInstance();
logger.logInfo(message, req, res.locals.requestId);
logger.logError(error, req, res.locals.requestId);
```

---

## Important Notes
- **Always use TypeScript strict mode** (`tsconfig.json` enforces `strict: true`)
- **Database**: PostgreSQL only; connection parsed from `DATABASE_URL` env var
- **Prisma client output**: Hardcoded to `src/generated/prisma/` — regenerate after schema changes
- **Port**: Binds to `0.0.0.0` (all interfaces) by default for container/cloud deployments
- **Async/await required**: Database calls are async; always await Prisma queries
- **Response format**: Must use `ResponseFormatter` class for consistent structure across endpoints
