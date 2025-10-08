# Feature-Based Architecture

Each feature is self-contained with:

## Structure

- `components/`: Feature-specific UI components
- `hooks/`: Feature-specific custom hooks  
- `services/`: API and business logic
- `types/`: TypeScript definitions
- `utils/`: Feature utilities

## Features

- `auth/`: Authentication and authorization
- `dashboard/`: Main dashboard functionality
- `workflow/`: Workflow builder and management
- `analytics/`: Analytics and reporting
- `collaboration/`: Team collaboration features

## Shared Modules

- `shared/components/`: Reusable UI components
- `shared/hooks/`: Common custom hooks
- `shared/lib/`: Utility libraries and configurations
- `shared/types/`: Global type definitions
- `shared/utils/`: Common utility functions

## Import Rules

- Features can import from `shared/` modules
- Features cannot import from other features directly
- App layer can import from both `features/` and `shared/`
- Shared modules cannot import from features