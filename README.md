# Claims Management System

A modern React application for managing insurance claims, built with performance and user experience in mind.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. **Start the mock API server:**

```bash
cd mock
npm install
npm run mock
```

API will be available at `http://localhost:8001`

2. **Install dependencies and start development:**

```bash
cd react-claim-app
pnpm install
pnpm run dev
```

Application will be available at `http://localhost:3000`

### Environment Setup

Create a .env file in the React project and add the following configuration for the Docker build.

# Ports Configuration

```bash

FRONTEND_PORT=3000
API_PORT=8001

# API Configuration for React app

PUBLIC_API_URL=http://api-mock:${API_PORT}

# Mock Server Configuration

MOCK_PORT=${API_PORT}

```

### Build for Production

```bash
pnpm run build
pnpm run preview
```

## Docker Setup Optional

### Prerequisites

- Docker and Docker Compose installed on your system

### Quick Start

```bash
# After cloning place this react repo inside the updated-senior-fe-assignment
# Ensure you're in the updated-senior-fe-assignment directory
# with react-claim-app and mock folders alongside docker-compose.yml run

docker-compose up --build
```

This will automatically:

- Build and start the React frontend on `http://localhost:3000`
- Build and start the mock API server on `http://localhost:8001`
- Set up proper networking between containers

### Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8001

### Development Commands

```bash
# Stop the application
docker-compose down
```

### Project Structure

Ensure your folder structure looks like this:

```
updated-senior-fe-assignment/
├── mock/                    # Mock API server
├── react-claim-app/         # React frontend (this folder)
├── docker-compose.yml       # Docker orchestration
├── .env                     # Environment variables
└── README.md               # Main project README
```

## Tech Stack

### Core Technologies

- **React 19** - Chosen for its flexibility and broad ecosystem support, enabling integration with legacy systems and various backend architectures
- **TypeScript**
- **Rsbuild**
- **React Router**
- **Tailwind CSS**

### Libraries & Tools

- **React Hook Form** + **Zod** - Form management and validation
- **React DatePicker** - Accessible date selection
- **Vitest** + **React Testing Library** - Testing framework
- **ESLint** + **Prettier** - Code quality and formatting

### Architecture Pattern

- **Feature-Sliced Design** - Scalable architecture methodology
- **Custom Hooks** - Reusable business logic
- **Virtual Scrolling** - Performance optimization for large datasets

## Key Decisions

### Custom Data Fetching vs TanStack Query

**Decision**: Built custom hooks with direct `fetch()` calls instead of TanStack Query
**Rationale**: Control over bundle size and memory management for massive datasets

### Sliding Window Data Loading

**Decision**: Load data in 1000-record virtualized chunks
**Benefits**: Have more contriol pn the cirtualization and avoid library usage for bundle size

### Current Data Management Approach

**Decision**: Custom chunk-based loading with in-memory caching
**Benefits**: Simple, effective for current use case with good performance

**Future Enhancement**: Implement LRU cache for data chunks with automatic eviction of least-used data, enabling instant navigation between cached ranges.
Add Web Workers for offloading heavy data processing tasks from main thread, ensuring responsive UI during large dataset operations. Both of these were inprogress.

### Feature-Sliced Design Implementation

**Decision**: Organized code by business domains (entities/features/widgets/shared)
**Benefits**: Scalable, maintainable, and team-friendly architecture

## Trade-offs Made

### Bundle Size vs Advanced Features

- **Trade-off**: Chose simpler data fetching over feature-rich libraries
- **Impact**: Smaller bundle (169KB gzipped) vs less built-in caching features and quicker build times
- **Rationale**: Better performance for target use case

### Custom Implementation vs Libraries

- **Trade-off**: Built custom virtualization vs using react-window
- **Impact**: More control and learning vs faster development
- **Rationale**: Deep understanding of performance requirements

### Direct fetch() vs Query Library

- **Trade-off**: Manual error handling vs automatic retries/caching
- **Impact**: More code to maintain vs larger bundle
- **Rationale**: Precise control for edge cases

## CI/CD Pipeline Jobs

The project includes a comprehensive CI/CD pipeline with 8 automated jobs:

- **Lint Job** (`CI / lint`)
- **Test Job** (`CI / test`)
- **Build Job** (`CI / build`)
- **Type Check Job** (`CI / typecheck`)
- **Format Job** (`CI / format`)
- **Coverage Job** (`CI / coverage`)
- **Security Job** (`CI / security`)
- **Bundle Size Job** (`CI / bundle-size`)

### Branching Strategy & GitHub Rules

**Branching Strategy**: Implemented Git Flow with `main` branch as production and feature branches for development work. All changes merged via pull requests to ensure code review and quality gates.

**GitHub Rules**:

- Code owner reviews required for all pull requests
- All CI/CD pipelines must pass before merge
- Branch protection rules enabled on `main` branch
- Automated dependency updates via Dependabot

### ESLint Configuration

The project uses a modern ESLint flat config setup with comprehensive rules for:

- **JavaScript/TypeScript**: `@eslint/js` recommended rules
- **TypeScript**: Strict type checking rules
- **React**: Full React and JSX runtime rules
- **React Hooks**: Hook dependency validation

### Available Scripts

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues automatically
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check formatting without changes
pnpm format:check

# TypeScript type checking
pnpm typecheck
```

## Performance Metrics

- **Bundle Size**: `169KB gzipped`
- **Data Handling**: Unlimited records with constant memory usage
- **Load Time**: Fast initial load with lazy route splitting
- **Virtualization**: Smooth scrolling with 1000+ rendered rows

## What I'd Improve With More Time

### 1. Advanced Caching Strategy

- Implement **IndexedDB** for offline data persistence
- Add **Service Worker** for background synchronization
- Build intelligent cache invalidation using LRU or sliding windown pattern

### 2. Enhanced Testing Coverage

- Add **end-to-end tests** with Playwright
- Implement **visual regression testing**
- Add **performance monitoring** in tests load test

### 3. Advanced Features

- **Real-time updates** with WebSocket connections
- **Bulk operations** for multiple claim management
- **Advanced filtering** with saved filter presets
- **Export functionality** (PDF, CSV)

### 4. Production Optimizations

- Implement **bundle splitting** by feature routes
- Add **performance monitoring** (Core Web Vitals)
- Set up **error tracking** (TrackJS, DataDog, Sentry, LogRocket)
- Add **A/B testing** framework

### 5. Developer Experience

- Set up **Storybook** for component documentation
- Add **GitHub Actions** for CI/CD
- Implement **automated deployment** pipelines
- Create **design system** documentation
- Automate Code review procrss.

## Testing

```bash
pnpm run test          # Run test suite
pnpm run test:ui       # Interactive test UI
```

Includes integration tests covering complete user flows and unit tests for critical business logic.

## Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run test` - Run test suite
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format with Prettier
- `pnpm run typecheck` - TypeScript type checking

## Features Implemented

### Core Requirements (All Completed)

- **Claims Dashboard** with search, filter, sort, and dual view modes
- **Create Claim Form** with auto-complete, validation, and smart behaviors
- **TypeScript** with strict typing and error boundaries
- **Lazy Loading** and performance optimizations
- **Comprehensive Testing** with integration coverage

### Bonus Features Added

- **Virtual Scrolling** for handling massive datasets
- **Column Customization** with persistence
- **Keyboard Navigation** for accessibility
- **Advanced Error Handling** with retry mechanisms
- **URL State Management** for shareable links

## Architecture Overview

```
src/
├── entities/claim/        # Business entities
├── features/claims-management/  # Feature modules
├── widgets/claims-dashboard/    # Page compositions
├── shared/                 # Reusable code
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilities
│   └── ui/                # Shared components
└── tests/                 # Testing infrastructure
```

This Feature-Sliced Design ensures scalability, maintainability, and clear separation of concerns.

## Monorepo & Microfrontend Integration

### Monorepo Integration

- **Feature-Sliced Design** - Clean separation allows easy extraction of shared business logic, UI components, and utilities into separate npm packages for monorepo usage

### Microfrontend Ready

- **Module Federation Compatible** - Rsbuild supports Webpack Module Federation, enabling this app to be exposed as remote modules for microfrontend architectures
