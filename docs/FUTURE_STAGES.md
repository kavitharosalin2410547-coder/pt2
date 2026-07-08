# Future Stages

## Stage 1: Placement Tracker MVP

Expected domains:

- Authentication
- Student profile
- Company applications
- Interview rounds
- Offers and outcomes
- Dashboard summaries

Architecture additions:

- `backend/src/routes/auth.routes.ts`
- `backend/src/routes/applications.routes.ts`
- `backend/src/services/auth.service.ts`
- `backend/src/services/applications.service.ts`
- `frontend/src/pages/auth`
- `frontend/src/pages/dashboard`
- `frontend/src/pages/applications`

## Stage 2: Intelligent Learning System

Expected domains:

- DSA Tracker
- Core CS Tracker
- Full Stack Tracker
- Analytics
- Exam Planning
- Placement Readiness Score

Architecture guidance:

- Add each learning domain as a feature area without changing auth or application tracking contracts.
- Store progress, milestones, topic metadata, and attempts as separate models.
- Add analytics through read-oriented services that aggregate existing data.

## Stage 3: AI Platform

Expected domains:

- AI Placement Assistant
- AI Daily Planner
- Mock Interviews
- Resume Builder intelligence

Architecture guidance:

- Isolate AI provider calls behind backend services.
- Never call AI APIs directly from the frontend.
- Store prompts, generated artifacts, audit metadata, and user feedback separately.
- Use queues/background jobs if AI workflows become long-running.

## Stage 4: Complete Placement Ecosystem

Expected domains:

- Hackathons
- Notifications
- Resume Builder
- Interview scheduling
- College/admin views
- Ecosystem analytics

Architecture guidance:

- Add notification providers behind a notification service.
- Introduce role-based access control before admin features.
- Keep public APIs versionable.
- Prefer additive database migrations.
