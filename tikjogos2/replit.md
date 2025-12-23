# Overview

This is a multiplayer social deduction game called "Quem é o Impostor?" (Who is the Impostor?), inspired by games like Spyfall. Players join game rooms where one player is secretly assigned as the impostor while others are crew members. The impostor must blend in while crew members try to identify them through discussions and voting.

The application features 5 distinct game modes:
- **Palavra Secreta** (Secret Word): Crew members receive the same word; impostor doesn't know it
- **Locais & Funções** (Locations & Roles): Players receive locations and roles; impostor doesn't know the location
- **Duas Facções** (Two Factions): Two teams with different words; impostor knows neither
- **Categoria + Item** (Category + Item): Crew knows category and item; impostor only knows category
- **Perguntas Diferentes** (Different Questions): Crew and impostor receive similar but different questions

The game supports 3-15 players with real-time WebSocket communication, session persistence, and Google AdSense integration for monetization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as build tool and dev server
- Wouter for client-side routing
- TailwindCSS with custom theme configuration
- Radix UI component library (shadcn/ui components)
- Zustand for client-side state management
- TanStack Query for server state management

**Key Design Decisions:**
- **Single Page Application**: All game states managed client-side with routing handled by Wouter
- **Component-Based Architecture**: Modular UI components for game modes, voting systems, and player interactions
- **Real-time Updates**: WebSocket connection managed through Zustand store for live game synchronization
- **Responsive Design**: Mobile-first approach with custom breakpoints for optimal gameplay on all devices
- **Custom Theming**: Color palette matching game aesthetics (dark blues, oranges, greens) defined in Tailwind config

**State Management Strategy:**
- Zustand store (`gameStore.ts`) manages: room state, player list, game mode, voting, notifications
- TanStack Query handles: user authentication state, server data fetching
- Local storage: selected game submodes, session persistence

## Backend Architecture

**Technology Stack:**
- Node.js with Express
- TypeScript throughout
- WebSocket (ws library) for real-time communication
- Drizzle ORM for database interactions
- Passport.js for authentication (GitHub OAuth2)
- Express sessions with PostgreSQL store

**Key Design Decisions:**
- **Dual Storage Strategy**: In-memory storage with optional PostgreSQL persistence for production deployments
- **WebSocket Protocol**: Custom message-based protocol for game events (create room, join, start game, vote, etc.)
- **Session Management**: Production uses PostgreSQL-backed sessions; development falls back to memory store
- **Stateless API Design**: REST endpoints for static operations; WebSocket for stateful game interactions
- **Authentication Flexibility**: Supports both GitHub OAuth (Replit environment) and development fallback

**API Structure:**
- `/api/auth/*` - Authentication endpoints (login, logout, user info)
- `/api/version` - Version information endpoint
- WebSocket events: `create`, `join`, `start`, `vote`, `submitAnswer`, `newRound`, `leave`

## Data Storage

**Database Schema (PostgreSQL via Drizzle):**

1. **sessions table**: Express session storage with TTL
   - sid (primary key), sess (jsonb), expire (timestamp)
   - Indexed on expire for efficient cleanup

2. **users table**: User profile information
   - id, email, firstName, lastName, profileImageUrl
   - createdAt, updatedAt timestamps
   - Used for authenticated users (GitHub integration)

3. **rooms table**: Game room state
   - code (primary key), hostId, status, gameMode
   - currentCategory, currentWord, impostorId
   - gameData (jsonb for mode-specific data)
   - players (jsonb array)
   - createdAt timestamp

**Design Rationale:**
- JSONB fields provide flexibility for varied game mode data structures
- In-memory fallback ensures development experience without database dependency
- Session table enables horizontal scaling in production
- Rooms stored ephemerally (can be memory-only) as games are temporary

## Authentication & Authorization

**Dual Authentication System:**

1. **GitHub OAuth (Primary)**: For Replit deployments
   - Uses openid-client with Passport.js strategy
   - Stores access/refresh tokens in session
   - Auto-refreshes expired tokens

2. **Development Fallback**: When GitHub credentials unavailable
   - Session-based identification without OAuth
   - Uses session secret (dev-only default provided)
   - Warns in development, errors in production if misconfigured

**Session Security:**
- HttpOnly cookies prevent XSS attacks
- Secure flag enabled in production (HTTPS)
- 7-day session TTL with automatic cleanup
- CSRF protection through session validation

**Host Privileges:**
- Room creator becomes host (tracked by hostId)
- Host can: start game, select game modes, initiate voting
- Host transfer on disconnect (first remaining player)

# External Dependencies

**Third-Party Services:**

1. **Neon Database** (`@neondatabase/serverless`)
   - Serverless PostgreSQL for production deployments
   - WebSocket-based connection pooling
   - Environment variable: `DATABASE_URL`

2. **Google AdSense**
   - Integrated for monetization
   - Client ID: `ca-pub-6805740083898879`
   - Async script loading in HTML head
   - `ads.txt` configured for verification

3. **GitHub OAuth** (via `@octokit/rest`, `passport-github2`)
   - User authentication for Replit environment
   - Requires: `REPL_ID`, `ISSUER_URL`, `SESSION_SECRET`
   - Optional in development; required in production

**Key Libraries:**

- **Drizzle ORM**: Type-safe database operations with schema migrations
- **WebSocket (ws)**: Real-time bidirectional communication
- **Passport.js**: Authentication middleware with GitHub strategy
- **connect-pg-simple**: PostgreSQL session store for Express
- **Zod**: Runtime type validation for API payloads
- **Nanoid**: Secure random ID generation for room codes

**Build & Development Tools:**

- **Vite**: Frontend bundling and HMR
- **esbuild**: Server bundling with allowlist for dependency optimization
- **TailwindCSS**: Utility-first styling
- **TypeScript**: Type safety across client and server
- **tsx**: TypeScript execution for scripts

**Replit-Specific Integrations:**

- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Code navigation enhancement
- `@replit/vite-plugin-dev-banner`: Development environment indicator
- Custom meta images plugin for OpenGraph tags with Replit domain detection

**Environment Configuration:**

Required for production:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Express session encryption key
- `NODE_ENV`: "production" or "development"

Optional (GitHub auth):
- `REPL_ID`, `ISSUER_URL`: Replit OAuth configuration
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: GitHub OAuth credentials