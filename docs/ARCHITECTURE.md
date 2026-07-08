# Architecture

## Core Rules

- Keep frontend and backend separated.
- Use TypeScript everywhere with strict type checking.
- Add new behavior through existing boundaries: routes, controllers, services, repositories/data access, UI components, hooks, contexts, and services.
- Do not rebuild working functionality when adding future stages.
- Use environment variables for deployment-specific values.
- Prefer reusable components and services over feature-local duplication.

## Frontend

The frontend is a Vite React application.

```text
frontend/src/
  components/    reusable UI components
  layouts/       route shells and page layouts
  pages/         route-level screens
  services/      API clients and frontend service modules
  hooks/         reusable React hooks
  contexts/      cross-cutting React providers
  types/         shared frontend types
  utils/         pure helper functions
```

### Frontend Extension Rules

- Add route-level screens under `pages`.
- Keep reusable controls under `components`.
- Keep API calls inside `services`; pages should not call Axios directly.
- Put authentication state in `contexts` and auth helpers in `services`.
- Put shared DTOs and view models in `types`.

## Backend

The backend is an Express API application.

```text
backend/src/
  controllers/   HTTP request/response orchestration
  routes/        Express route registration
  services/      business logic and reusable backend workflows
  middleware/    auth, errors, validation, logging
  prisma/        Prisma client wrapper
  config/        environment and application config
  utils/         pure helper functions
  types/         backend-specific TypeScript types
```

### Backend Extension Rules

- Routes define endpoints and attach middleware.
- Controllers translate HTTP input into service calls.
- Services contain business logic and are reusable across controllers.
- Prisma access should be centralized through shared modules and service boundaries.
- Validation should be added before controller logic.
- Errors should flow through centralized error middleware.
- Async controller failures should be passed through reusable async middleware helpers.

## Clean Architecture Direction

As the app grows, feature modules should keep a stable dependency direction:

```text
HTTP routes -> controllers -> services -> persistence/external integrations
```

Frontend route pages should depend on reusable UI, hooks, contexts, and service clients rather than duplicating state and request logic.

## Naming Conventions

- React components: `PascalCase`
- Hooks: `useCamelCase`
- Services: `camelCaseService` or domain-specific exported functions
- Types/interfaces: `PascalCase`
- Files: `kebab-case.ts` for non-components, `PascalCase.tsx` for components
- Environment variables: `UPPER_SNAKE_CASE`
