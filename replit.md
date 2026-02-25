# Replit.md

## Overview

This is a full-stack dental practice website built for Christopher B. Wong, DDS in Palo Alto. The application features a modern React frontend with a Node.js Express backend, utilizing PostgreSQL for data storage and Drizzle ORM for database operations. The site includes appointment scheduling, contact forms, service information, patient resources, and administrative features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Hookform Resolvers
- **Animations**: Framer Motion for smooth transitions

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API**: RESTful endpoints for appointments, contacts, services, and testimonials
- **Middleware**: Compression, JSON parsing, static file serving
- **Development**: tsx for TypeScript execution

### Database & ORM
- **Database**: PostgreSQL (via Neon Database serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Schema**: Shared TypeScript schema definitions
- **Validation**: Zod for runtime type validation

## Key Components

### Database Schema
- **Users**: Authentication and user management
- **Appointments**: Patient appointment scheduling
- **Contact Messages**: Contact form submissions
- **Services**: Dental service offerings
- **Blog Posts**: Content management for dental articles
- **Testimonials**: Patient reviews and feedback

### Frontend Pages
- Home page with hero section and service overview
- About page with doctor and team information
- Services page with detailed service descriptions
- Specialized service pages (Dental Veneers, Implants, Invisalign, Emergency)
- Patient resources with forms and FAQs
- Contact and scheduling pages
- Legal pages (Privacy Policy, Terms, HIPAA Notice, Accessibility)

### Forms & Integrations
- TypeForm integration for appointment scheduling
- Custom contact forms with validation
- Patient information forms
- Newsletter subscription handling

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **Server Processing**: Express routes handle requests and validate data
3. **Database Operations**: Drizzle ORM executes PostgreSQL queries
4. **Response Handling**: JSON responses sent back to client
5. **State Updates**: React Query updates component state automatically

## External Dependencies

### Core Dependencies
- React ecosystem (React, React DOM, React Query)
- Express.js for server framework
- Drizzle ORM and PostgreSQL driver
- Tailwind CSS and Radix UI components
- TypeScript for type safety

### Development Tools
- Vite for bundling and development server
- ESBuild for production server bundling
- Drizzle Kit for database migrations
- Various Replit-specific plugins for development

### External Services
- Neon Database for PostgreSQL hosting
- Google Analytics for website tracking (G-94WRBJY51J)
- Hotjar for user behavior analytics
- TypeForm for appointment scheduling

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Server**: tsx runs TypeScript server directly
- **Port**: 5000 with Vite dev server and HMR

### Production Build
- **Frontend**: `vite build` creates optimized static assets
- **Backend**: `esbuild` bundles server code to ES modules
- **Output**: Static files in `dist/public`, server in `dist/index.js`

### Production Runtime
- **Command**: `npm run start`
- **Environment**: NODE_ENV=production
- **Static Serving**: Express serves built frontend assets
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Replit Configuration
- **Modules**: nodejs-20, bash, web, imagemagick
- **Deployment**: Autoscale target with port 80 external mapping
- **Build Process**: Automated via workflow configuration

## Changelog

- January 31, 2025. Updated Google Analytics tracking ID
  - Replaced old tracking ID (G-9B141WTH4R) with new correct data stream ID (G-94WRBJY51J)
  - Updated in both index.html and GoogleAnalytics component
  - Maintains existing page view tracking and event tracking functionality
- January 10, 2025. Comprehensive responsive redesign of Analytics Dashboard
  - Built fully responsive analytics page (AnalyticsResponsive.tsx) optimized for all devices
  - **Mobile (< 768px)**: Hamburger menu, stacked cards, touch-optimized controls, progressive disclosure
  - **Tablet (768px - 1024px)**: 2-column grid layouts, horizontal navigation tabs, medium-sized charts
  - **Desktop (> 1024px)**: Fixed sidebar navigation, 3-column grids, detailed charts with radar visualization
  - Responsive metric cards with hover effects and scaling animations
  - Dynamic chart heights that adapt to viewport size (h-48 mobile, h-64 tablet, h-96 desktop)
  - Responsive typography (text-xs mobile, text-sm tablet, text-base desktop)
  - Grid layouts that adapt from 1 column (mobile) to 2-3 columns (tablet/desktop)
  - Desktop-specific features: sidebar with quick stats, radar charts, hover interactions
  - Tablet optimizations: 2-column layouts, medium data density, touch-friendly targets
  - Mobile-first base with progressive enhancement for larger screens
  - Integrated July 2025 real marketing data with 916 new users
  - Password protection with session-based authentication ("chris")
- January 08, 2025. Enhanced About page with mobile-first design principles
  - Improved responsive typography and spacing
  - Added smooth animations using Framer Motion
  - Optimized touch interactions for mobile devices
  - Enhanced card layouts with better mobile stacking
  - Added hover effects and micro-interactions
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.