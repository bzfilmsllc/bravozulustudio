# Overview

This is a full-stack web application designed as a social platform for military members and filmmakers. The application serves as a comprehensive tool for script writing, project collaboration, community building, and media sharing within the military creative community. It features role-based access control with public, pending, and verified member tiers, along with specialized tools for scriptwriting, design, and festival submissions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with role-based route protection
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation schemas
- **Styling**: Tailwind CSS with CSS variables for theming and a dark-mode design system

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API endpoints with consistent error handling and request logging

## Database Design
- **Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle migrations with schema-first approach
- **Key Entities**: 
  - Users with role-based permissions (public, pending, verified)
  - Military verification system with branch and service details
  - Scripts with AI-powered writing assistance
  - Projects with collaboration features
  - Forum system with categories, posts, and replies
  - Friend system with requests and connections
  - Messaging system for private communications
  - Reporting system for content moderation

## Authentication & Authorization
- **Identity Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed session store with 7-day expiration
- **Role-Based Access**: Three-tier system (public, pending, verified) with middleware protection
- **Military Verification**: Multi-step verification process for service members

## Development & Build Process
- **Development**: Hot module replacement with Vite dev server
- **Build**: Vite for frontend bundling, esbuild for server compilation
- **Type Safety**: Shared TypeScript schemas between client and server
- **Code Organization**: Monorepo structure with shared types and utilities

# External Dependencies

## Core Technologies
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth OIDC provider
- **Build Tools**: Vite (frontend), esbuild (backend), TypeScript compiler

## UI & Styling
- **Component Library**: Radix UI primitives with shadcn/ui abstractions
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React icon library
- **Fonts**: Google Fonts (Inter, Playfair Display, Fira Code)

## Data Management
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas for runtime type validation
- **State Management**: TanStack Query for API state management
- **Date Handling**: date-fns for date manipulation

## Development & Deployment
- **Runtime**: Node.js with tsx for development execution
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Utilities**: memoizee for function memoization, nanoid for ID generation
- **Development**: Replit-specific plugins for error handling and development tooling