# Features and Implementation

This document explains what each major feature does and how it is implemented in the codebase.

## System Structure

The app is split into two workspaces:

- `frontend/`: React + Vite + TypeScript UI
- `backend/`: Express + TypeScript API with Prisma and PostgreSQL

The dependency direction is consistent across the app:

`page -> frontend service -> API client -> backend controller -> backend service -> Prisma`

This keeps UI code free of direct HTTP details and keeps business logic out of controllers.

## Authentication

What it does:

- Handles signup, login, and persisted sessions.
- Protects all internal routes behind authenticated access.

How it is implemented:

- Frontend auth state lives in `frontend/src/contexts/AuthContext.tsx`.
- The token is stored in `localStorage` through `frontend/src/services/apiClient.ts`.
- `frontend/src/components/auth/ProtectedRoute.tsx` blocks unauthenticated navigation.
- Backend auth routes and controllers issue JWTs and validate requests through `backend/src/routes/auth.routes.ts` and `backend/src/controllers/auth.controller.ts`.
- Password hashing and token utilities are isolated in `backend/src/utils/password.ts` and `backend/src/utils/jwt.ts`.

## Dashboard

What it does:

- Gives a single overview of the user's preparation status.
- Summarizes tasks, learning progress, placement progress, interviews, and resume readiness.

How it is implemented:

- `frontend/src/pages/DashboardPage.tsx` loads multiple summaries in parallel using `Promise.all`.
- It combines data from task, learning, placement, interview, and resume services.
- UI is composed from reusable cards such as `StatCard`, `DashboardCard`, and `ProgressRing`.
- The page derives "today" and "upcoming" task subsets client-side from the loaded task list.

## Tasks

What it does:

- Lets the user create, edit, filter, complete, and delete preparation tasks.
- Supports task categories, priorities, due dates, and completion state.

How it is implemented:

- Frontend logic is in `frontend/src/pages/TasksPage.tsx`.
- The page keeps local state for task list, filters, edit mode, loading state, and submit state.
- CRUD calls go through `frontend/src/services/taskService.ts`.
- The reusable task editor and list live in `frontend/src/components/tasks/`.
- Backend task routes, controller, and service are separated in `backend/src/routes/task.routes.ts`, `backend/src/controllers/task.controller.ts`, and `backend/src/services/task.service.ts`.
- Filtering is handled by query parameters on the API side and by local filter state on the UI side.

## Calendar

What it does:

- Shows task scheduling in week and month views.

How it is implemented:

- `frontend/src/pages/CalendarPage.tsx` loads the task list once and switches the visual mode between `week` and `month`.
- `frontend/src/components/calendar/CalendarGrid.tsx` renders the calendar layout.
- The page is intentionally read-only; it reuses task data rather than maintaining a separate calendar model.

## DSA Tracker

What it does:

- Tracks DSA problems, their difficulty, status, solution links, and roadmap coverage.
- Imports and syncs a NeetCode 150 catalog into the user's tracker.

How it is implemented:

- `frontend/src/pages/DSATrackerPage.tsx` drives the experience.
- It imports the catalog on first mount, then loads filtered and full problem lists in parallel.
- UI state includes loading, refresh, catalog sync, and local filters for topic, difficulty, status, and sort order.
- The page computes roadmap coverage client-side from the full problem set.
- Backend logic sits in the learning service layer under `backend/src/services/dsa.service.ts` and its related routes/controllers.
- Shared DSA constants and label helpers live in `frontend/src/utils/learning.ts`.

## Core CS

What it does:

- Tracks core computer science topics such as OS, DBMS, CN, and OOP.
- Supports topic initialization and status updates.

How it is implemented:

- `frontend/src/pages/CoreCSPage.tsx` loads topic rows and derives per-subject completion summaries with `useMemo`.
- Users can initialize a default topic set, add a topic, and update a topic status inline.
- The page uses `ProgressSummary`, `DashboardCard`, `Select`, and `Input` as the main controls.
- Backend persistence is handled by the learning service layer and Prisma models for core CS progress.

## Full Stack

What it does:

- Tracks full-stack technologies like React, Angular, Spring Boot, and .NET.
- Supports initialization of default technologies and status updates for each entry.

How it is implemented:

- `frontend/src/pages/FullStackPage.tsx` mirrors the Core CS page structure.
- It keeps a compact form for adding/upserting progress and a per-technology card grid for inline editing.
- Completion percentage is derived client-side from the loaded items.
- Backend storage is handled through the learning service and Prisma records for full-stack progress.

## Study History

What it does:

- Logs study sessions with category, duration, date, and notes.
- Tracks total, weekly, monthly, and streak-based study metrics.

How it is implemented:

- `frontend/src/pages/StudyHistoryPage.tsx` stores a form model and edit state locally.
- The page uses `studySessionService` for list, summary, create, update, and delete actions.
- The date field is normalized to an ISO timestamp before submission so the backend receives a stable format.
- The summary section is rendered from server-provided aggregate data rather than computed entirely in the UI.

## Analytics

What it does:

- Provides study and learning analytics in a dedicated read-only view.
- Surfaces weak areas, strong areas, charts, and productivity trends.

How it is implemented:

- `frontend/src/pages/AnalyticsPage.tsx` is a pure read page with no mutation flow.
- It fetches one analytics object and renders the charts using `LearningChart`.
- Insight cards and area lists are derived directly from the analytics response.

## Placement Tracker

What it does:

- Tracks job applications across stages such as wishlist, applied, OA, interview, selected, and rejected.
- Supports drag-and-drop board movement, tabular inspection, filtering, and edit/delete flows.

How it is implemented:

- `frontend/src/pages/PlacementTrackerPage.tsx` holds the application list, statistics, filter state, edit form, and drag state.
- The board is a column model mapped from statuses, which lets the same data render both as a table and as a pipeline board.
- Status/round updates are sent through `frontend/src/services/placementService.ts`.
- Backend endpoints are split across `backend/src/routes/placement.routes.ts`, `backend/src/controllers/placement.controller.ts`, and `backend/src/services/placement.service.ts`.
- The Prisma model uses indexed fields for user, status, company, role, and deadline to support filtering and dashboards efficiently.

## Interview Prep

What it does:

- Maintains a question bank, practice statuses, and mock interview logs.
- Surfaces resume readiness alongside interview readiness so the user can see cross-feature progress.

How it is implemented:

- `frontend/src/pages/InterviewPrepPage.tsx` manages two independent forms: one for questions and one for mock interviews.
- The page loads questions, mocks, interview statistics, and resume statistics in parallel.
- Practice questions are filtered by category, difficulty, status, and search text.
- Mock interview ratings are displayed in table form and charted through `LearningChart`.
- Backend interview and mock interview workflows are handled by the interview service and corresponding routes/controllers.

## Resume Hub

What it does:

- Stores resume versions, uploaded files, checklist state, ATS readiness state, and update dates.
- Lets the user create new versions, edit existing versions, download attached files, and compare readiness scores.

How it is implemented:

- `frontend/src/pages/ResumeHubPage.tsx` owns the full UI state for resume forms, list data, editing mode, and statistics.
- The page submits through `frontend/src/services/resumeService.ts`, which converts the date picker value into an ISO timestamp for the backend.
- Resume cards render version badges, file metadata, target role, readiness scores, and action buttons.
- Backend CRUD lives in `backend/src/controllers/resume.controller.ts` and `backend/src/services/resume.service.ts`.
- Validation is enforced in `backend/src/validators/resume.validators.ts` so both create and update requests are schema checked.
- Resume data is stored in PostgreSQL through Prisma's `ResumeVersion` model in `backend/prisma/schema.prisma`.
- The default form now suggests the next numeric version label by scanning existing labels like `v1`, `v2`, and `v3`, so a new draft does not keep falling back to `v1` after earlier versions already exist.

## Settings

What it does:

- Lets the user configure the study mode preference used by scheduling logic.

How it is implemented:

- `frontend/src/pages/SettingsPage.tsx` loads the current preference on mount and writes updates back through `preferenceService`.
- The UI is a minimal select-and-save flow because the setting is a single enum value.
- The backend stores the preference in its own model, keeping it separate from task and study history data.

## Shared Patterns

The app repeats a few implementation patterns across features:

- Pages own local UI state and request orchestration.
- Services encapsulate API calls and input shaping.
- Controllers translate HTTP requests into service calls.
- Prisma models define the persistence contract and indexes.
- Reusable UI components keep forms, cards, buttons, progress visuals, and loading/error states consistent.

That structure is what makes the codebase easy to extend without rewriting the earlier modules.
