# Overview

This project, branded as **TikJogos**, is a multiplayer social deduction web game. Players join game rooms to identify an impostor using various game modes, including secret words, locations, roles, and unique questions. It's designed as a full-stack application with real-time capabilities. The vision is to offer an engaging, accessible social deduction experience with diverse game mechanics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend uses **React with TypeScript**, **Vite** for tooling, **Wouter** for routing, **TanStack Query** for server state, and **Zustand** for local state management. UI components are built with **Radix UI** primitives and **shadcn/ui**, styled using **Tailwind CSS** with a custom retro/vintage theme and the Poppins font.

## Backend Architecture

The backend is built with **Node.js and Express.js with TypeScript**, supporting real-time communication via a **WebSocket server (ws library)**. It uses a room-based architecture where the server broadcasts game state changes. Data storage is primarily **in-memory** but designed with interfaces for future **PostgreSQL** integration using **Drizzle ORM**. RESTful APIs handle initial setup, while WebSockets manage real-time game interactions.

## Database Schema

The application defines a **Room Model** for PostgreSQL (using Drizzle ORM for type safety) which includes room code, host ID, game status, current game mode, impostor assignments, and player data. **JSONB columns** are used for flexible storage of game-specific data, allowing for multiple game modes without complex schema changes.

## Game Modes Architecture

The game features five distinct modes:
1.  **Palavra Secreta**: Impostor doesn't receive the secret word. Includes submodes with themed word lists (e.g., Clássico, Clash Royale, Animes, Marvel, Stranger Things), each with visual selection cards.
2.  **Locais & Funções**: Players receive assigned locations and roles.
3.  **Duas Facções**: Two teams with different words; impostor knows neither.
4.  **Categoria + Item**: Category is revealed to all, but a specific item is hidden from the impostor.
5.  **Perguntas Diferentes**: Crew and impostor receive different questions, with an answer collection and reveal system.

Each mode has predefined word/category lists, and the server randomly assigns game elements. Client-side displays are role-specific.

## Build and Deployment

The build process uses **ESBuild** for server bundling and **Vite** for client-side assets. Development leverages Vite's HMR and Replit-specific plugins, while production serves static files. Environment variables (NODE_ENV) dictate configurations. Assets include custom OpenGraph meta tags and are served from the public directory.

# External Dependencies

## Database & ORM
-   **Neon Database**: Serverless PostgreSQL.
-   **Drizzle ORM**: Type-safe database toolkit.

## Real-time Communication
-   **ws**: WebSocket server implementation.

## UI Libraries
-   **Radix UI**: Accessible component primitives.
-   **shadcn/ui**: Components built on Radix UI.
-   **Lucide React**: Icon library.
-   **Tailwind CSS**: Utility-first CSS framework.

## Monetization
-   **Google AdSense**: Advertising platform.
-   **PIX**: Brazilian payment method integration.

## Development Tools
-   **Replit Vite Plugins**: Runtime error overlay, cartographer, dev banner.
-   **TypeScript**: For type safety.
-   **ESBuild**: Fast JavaScript bundler.

## Authentication
-   **GitHub OAuth**: OAuth2 authentication.
-   **connect-pg-simple**: PostgreSQL session storage (with in-memory fallback).

## Validation
-   **Zod**: Schema validation.
-   **drizzle-zod**: Integration for Drizzle schemas and Zod.