# AbsensiPro - Attendance Management System

## Overview
AbsensiPro is a modern attendance management system built with React, TypeScript, and Vite. It provides features for managing employee attendance, leave requests, and overtime tracking.

## Project Architecture
- **Frontend**: React with TypeScript, Vite, TailwindCSS, Shadcn/UI
- **Routing**: React Router DOM
- **State Management**: TanStack React Query
- **UI Components**: Shadcn/UI (Radix primitives)
- **Styling**: TailwindCSS with custom configuration

## Directory Structure
```
src/
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Page components
└── test/          # Test files
```

## Running the Project
- Development: `npm run dev` (runs on port 5000)
- Build: `npm run build`
- Preview: `npm run preview`
- Tests: `npm run test`

## Recent Changes
- January 28, 2026: Migrated from Lovable to Replit environment
  - Updated Vite config to use port 5000 and allow all hosts
  - Removed lovable-tagger dependency
