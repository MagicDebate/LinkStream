# Overview

LinkForge is an internal linking SaaS application designed as a single-page React application with mock data functionality. The application allows users to manage SEO internal linking strategies for websites through CSV import, link generation, and comprehensive campaign management. Built as an MVP with a focus on a streamlined, single-screen workflow without modals or popups, it provides tools for analyzing page relationships, generating contextual internal links, and managing linking campaigns with detailed analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: React hooks with localStorage persistence for mock data
- **Data Fetching**: TanStack React Query for caching and synchronization (configured for frontend-only operation)

## Component Structure
- **Layout Components**: Sticky header with user profile dropdown, sticky footer with version info
- **Page Components**: Login/register, projects list, and comprehensive project management single-screen interface
- **Project Sections**: Modular accordion-based sections for CSV import, global parameters, quick tasks, progress tracking, draft review, and run history
- **UI Components**: Complete shadcn/ui component library with form controls, data tables, progress indicators, and notification systems

## Data Management
- **Mock API Layer**: In-memory storage with localStorage persistence simulating backend operations
- **Schema Definition**: Shared TypeScript types for users, projects, pages, runs, and link candidates
- **Authentication**: Token-based mock authentication with localStorage session management
- **File Processing**: Client-side CSV parsing using Papa Parse library for data import

## Database Schema Design
- **Users**: Authentication and profile management
- **Projects**: Website project containers with domain association
- **Pages**: Individual web pages with metadata, content, and SEO attributes
- **Runs**: Link generation campaigns with configuration and status tracking
- **Link Candidates**: Generated internal link suggestions with approval workflow

## Single-Screen Architecture
- **Accordion Layout**: Collapsible sections for different workflow stages (import, configuration, generation, review)
- **Inline Forms**: All configuration and editing happens within the main interface without modals
- **Progressive Disclosure**: Sections expand/collapse to manage information density
- **Real-time Updates**: Live progress tracking and log streaming during link generation processes

## Configuration Management
- **Global Parameters**: Centralized settings for link generation behavior (max links per page, priority ordering, anchor text rules)
- **Task Configuration**: Individual task settings for different link types (hubs, commerce, similar content, orphan rescue)
- **Priority System**: Drag-and-drop priority ordering for link generation algorithms
- **Validation Rules**: Client-side validation for URL patterns, anchor text restrictions, and content requirements

# External Dependencies

## Core Frontend Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **Build Tools**: Vite with TypeScript support, PostCSS, Autoprefixer
- **UI Framework**: Radix UI primitives, shadcn/ui components, Tailwind CSS
- **Data Management**: TanStack React Query, React Hook Form with Zod validation
- **Utilities**: clsx for conditional classes, class-variance-authority for component variants, date-fns for date manipulation

## Development Tools
- **TypeScript**: Full type safety with strict configuration
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment plugins and error overlay

## Data Processing
- **Papa Parse**: CSV parsing and processing (loaded via CDN)
- **File Handling**: Native browser File API for drag-and-drop CSV upload
- **Mock Data Generation**: Custom algorithms for simulating link generation and analytics

## Database Layer (Future)
- **Drizzle ORM**: Configured for PostgreSQL with migration support
- **Neon Database**: Serverless PostgreSQL for production deployment
- **Connection**: Environment-based database URL configuration

## Fonts and Assets
- **Typography**: Inter font family from Google Fonts
- **Icons**: Lucide React icon library
- **Styling**: CSS custom properties for theming support