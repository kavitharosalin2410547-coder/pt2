# Stage 3 Build Prompt — Placement Tracker Pro

## Context

You are helping complete Stage 3 of a full-stack app called **Placement Tracker Pro**.
The project is a placement preparation tracker for engineering students.

### Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React
- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, JWT auth, Zod validation
- **Folder structure:**
  - `frontend/src/pages/` — page components
  - `frontend/src/components/` — shared components
  - `frontend/src/services/` — axios API wrappers
  - `frontend/src/types/` — TypeScript types
  - `backend/src/controllers/` — Express controllers
  - `backend/src/services/` — business logic
  - `backend/src/routes/` — Express routers
  - `backend/prisma/schema.prisma` — Prisma schema

### Existing patterns to follow
- All backend routes are registered in `backend/src/routes/index.ts` via `registerRoutes(app)`
- Controllers call services, services call Prisma
- All protected routes use the auth middleware: `import { authenticate } from '../middleware/auth.middleware.js'`
- Frontend services use `apiClient` from `frontend/src/services/apiClient.ts` (axios instance with base URL `/api` and JWT header)
- Frontend API responses are always `{ data: T }` — unwrap with `response.data.data`
- Env vars are validated in `backend/src/config/env.ts` using Zod — add new ones there
- Backend uses ES modules (`import/export`, `.js` extensions on imports)

---

## What to build — Stage 3 features

Stage 3 adds 5 features. Build them in this order:

---

### Feature 1 — Exam Date Integration with Auto-Adjust

**Backend:**

1. Add to `backend/prisma/schema.prisma`:
```prisma
enum ExamDateType {
  PLACEMENT
  EXAM
  INTERVIEW
  CONTEST
}

model ExamDate {
  id        String       @id @default(uuid())
  title     String
  date      DateTime
  type      ExamDateType
  notes     String?
  userId    String
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@index([userId, date])
  @@map("exam_dates")
}
```
Also add `examDates ExamDate[]` to the `User` model.

2. Run `prisma migrate dev --name add_exam_dates`.

3. Create `backend/src/services/exam-date.service.ts`:
   - `list(userId)` — return all exam dates for user sorted by date asc
   - `create(userId, input)` — create exam date, then call `autoAdjustTasks(userId, input.date)`
   - `update(userId, id, input)` — update exam date
   - `remove(userId, id)` — delete exam date
   - `autoAdjustTasks(userId, examDate: Date)` — query all PENDING tasks with `dueDate >= examDate`, update their priority to `HIGH` and push their dueDate back by 1 day if it falls on the exam date

4. Create `backend/src/controllers/exam-date.controller.ts` and `backend/src/routes/exam-date.routes.ts`.

5. Register in `backend/src/routes/index.ts`:
```ts
app.use('/api/exam-dates', examDateRouter);
```

**Frontend:**

1. Create `frontend/src/services/examDateService.ts` with list, create, update, remove.
2. Create `frontend/src/types/examDate.ts` with `ExamDate` type.
3. In `CalendarPage.tsx`, add an "Add Exam Date" button that opens a modal. Show exam dates as highlighted markers (red/orange chip) on the calendar grid. When a date is saved, show a toast: "Tasks near this date have been auto-adjusted."

---

### Feature 2 — Hackathon & Opportunity Alerts

**Backend:**

1. Add to `backend/prisma/schema.prisma`:
```prisma
enum OpportunityType {
  HACKATHON
  INTERNSHIP
  CONTEST
  FELLOWSHIP
}

model Opportunity {
  id                   String          @id @default(uuid())
  title                String
  organizer            String
  type                 OpportunityType
  startDate            DateTime
  endDate              DateTime
  registrationDeadline DateTime
  link                 String
  prizePool            String?
  teamSize             String?
  mode                 String?
  isRegistered         Boolean         @default(false)
  userId               String
  user                 User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt

  @@index([userId, type])
  @@index([userId, registrationDeadline])
  @@map("opportunities")
}
```
Also add `opportunities Opportunity[]` to the `User` model.

2. Run `prisma migrate dev --name add_opportunities`.

3. Create `backend/src/services/opportunity.service.ts`:
   - `list(userId, type?: OpportunityType)` — filter by type if provided, sort by registrationDeadline asc
   - `create(userId, input)` — create opportunity
   - `update(userId, id, input)` — update (including toggling isRegistered)
   - `remove(userId, id)` — delete

4. Create controller and routes at `/api/opportunities`.

**Frontend:**

1. Create `frontend/src/services/opportunityService.ts`.
2. Create `frontend/src/types/opportunity.ts`.
3. Create `frontend/src/pages/HackathonsPage.tsx`:
   - Tabs: All | Hackathons | Contests | Internships | Fellowships
   - Each card shows: title, organizer, dates, registration deadline (with countdown), prize pool, team size, mode
   - "Register Now" button opens `link` in a new tab
   - "Mark Registered" toggle button
   - "Add Opportunity" button opens a form modal
   - Cards with deadline within 3 days show a red "Closing Soon" badge
4. Add route `/hackathons` to `frontend/src/App.tsx`.
5. Add "Hackathons" link to the sidebar navigation.

---

### Feature 3 — Notifications System

**Frontend only** (browser notifications — no backend changes needed):

1. Create `frontend/src/hooks/useNotifications.ts`:
   - On mount, call `Notification.requestPermission()`
   - Export `sendNotification(title: string, body: string, icon?: string)` that creates a `new Notification(...)`
   - Export `scheduleNotification(title, body, delayMs)` using `setTimeout`

2. Create `frontend/src/services/notificationService.ts`:
   - `scheduleDailyReminder(preferredTime: string)` — parses "HH:MM" preferred study time from settings, calculates ms until that time today, schedules a notification: "Time to study! Open your plan for today."
   - `scheduleDeadlineAlerts(tasks: Task[])` — for each task due within 24h, schedule a notification 1h before due time: "Task due soon: {task.title}"
   - `scheduleStreakAlert()` — if no study session logged today (check localStorage key `lastStudyDate`), schedule a notification at 9pm: "Don't break your streak! Log a study session today."

3. In `frontend/src/App.tsx` or a top-level component, call `useNotifications()` on mount to request permission.

4. In `SettingsPage.tsx`, add a "Notifications" section with toggles:
   - Enable Daily Study Reminder
   - Enable Deadline Alerts
   - Enable Streak Alerts
   - Preferred Reminder Time (time input)
   Store these in localStorage under `notificationSettings`.

5. Create a `NotificationsBell` component for the top navbar that shows a dropdown of recent in-app alerts (store last 10 in a React context/state). Show a red dot badge when there are unread alerts.

---

### Feature 4 — AI Placement Assistant

**Backend:**

1. Install Gemini SDK:
```bash
npm install @google/generative-ai --workspace backend
```

2. Add `GEMINI_API_KEY` to `backend/src/config/env.ts`:
```ts
GEMINI_API_KEY: z.string().min(1),
```
And expose it as `env.geminiApiKey`.

3. Add `GEMINI_API_KEY=your_key_here` to `backend/.env.example`.

4. Create `backend/src/services/ai.service.ts`:
```ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const genAI = new GoogleGenerativeAI(env.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const SYSTEM_PROMPT = `You are an expert placement preparation assistant for engineering students preparing for campus placements in India. You help with:
- Data Structures & Algorithms (DSA) doubts
- Core CS subjects: OS, DBMS, Computer Networks, OOP
- HR interview questions and behavioral answers
- System Design basics
- Project explanations and resume tips
- Study roadmap and preparation strategy

Keep answers concise, practical, and student-friendly. Use examples. When explaining DSA, include time/space complexity.`;

export const aiService = {
  async chat(userMessage: string, context?: string): Promise<string> {
    const prompt = context
      ? `${SYSTEM_PROMPT}\n\nUser context: ${context}\n\nUser: ${userMessage}`
      : `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  },
};
```

5. Create `backend/src/controllers/ai.controller.ts`:
   - `chat` — accepts `{ message: string }`, calls `aiService.chat(message)`, returns `{ data: { reply: string } }`

6. Create `backend/src/routes/ai.routes.ts` and register at `/api/ai`.

**Frontend:**

1. Create `frontend/src/services/aiService.ts` with a `chat(message: string)` method.

2. Create `frontend/src/pages/AIAssistantPage.tsx`:
   - Chat UI: message history (user bubbles right, AI bubbles left), input box at bottom, send button
   - Show a loading spinner while waiting for AI response
   - Suggested prompt chips at the top when chat is empty:
     - "How do I improve in DSA?"
     - "Explain Dynamic Programming with example"
     - "Common HR interview questions"
     - "How to answer 'Tell me about yourself'?"
     - "What is the difference between process and thread?"
   - Clicking a chip sends it as a message
   - Add a "Clear Chat" button

3. Add route `/ai-assistant` in `App.tsx`.
4. Add "AI Assistant" link to sidebar with a sparkle/bot icon.

---

### Feature 5 — AI Daily Planner

**Backend:**

1. Add a new endpoint to the AI routes: `POST /api/ai/daily-plan`

2. In `backend/src/services/ai.service.ts`, add:
```ts
async generateDailyPlan(context: {
  weakDsaTopics: string[];
  pendingCoreCS: string[];
  todayTasks: string[];
  upcomingDeadlines: string[];
  studyHoursGoal: number;
}): Promise<string> {
  const prompt = `${SYSTEM_PROMPT}

Generate a structured study plan for today based on this student's data:
- Weak DSA topics needing revision: ${context.weakDsaTopics.join(', ') || 'none'}
- Pending Core CS topics: ${context.pendingCoreCS.join(', ') || 'none'}
- Today's scheduled tasks: ${context.todayTasks.join(', ') || 'none'}
- Upcoming deadlines (within 3 days): ${context.upcomingDeadlines.join(', ') || 'none'}
- Daily study hours goal: ${context.studyHoursGoal} hours

Output a prioritized schedule broken into time blocks. Be specific. Format as a clean numbered list with time estimates.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

3. In the `daily-plan` controller, before calling the AI:
   - Fetch user's DSA problems with status `REVISION_NEEDED` — extract topics
   - Fetch Core CS progress with status `NOT_STARTED` — extract subject+topic
   - Fetch today's tasks (not completed)
   - Fetch tasks due in the next 3 days
   - Fetch study preference for hours goal (default 4 if not set)
   Pass all this as context to `generateDailyPlan`.

**Frontend:**

1. Create `frontend/src/services/aiService.ts` method `generateDailyPlan()`.

2. In `DashboardPage.tsx`, add an "AI Daily Plan" card:
   - Shows a "Generate Today's Plan" button
   - On click, calls the API and shows a loading state ("Planning your day...")
   - Renders the AI response as formatted text in a card
   - Shows a "Regenerate" button after first generation
   - Store the generated plan in component state (re-fetched each session)

---

## Final wiring checklist

After building all features:

- [ ] All 5 new routes registered in `backend/src/routes/index.ts`
- [ ] `backend/.env.example` has `GEMINI_API_KEY=`
- [ ] All new pages added to `frontend/src/App.tsx` under the protected route
- [ ] Sidebar updated with links to: Hackathons, AI Assistant
- [ ] Notifications permission requested on app load
- [ ] `prisma migrate dev` run for ExamDate and Opportunity models

## Style guide

- Follow the exact same component patterns already in the codebase (look at `DSATrackerPage.tsx` and `PlacementTrackerPage.tsx` as reference)
- Use Tailwind for all styling — no inline styles
- Use Lucide React for icons
- Loading states: use the existing `LoadingState` component from `frontend/src/components/common/`
- Error states: use the existing `ErrorState` component
- All forms: use controlled inputs with `useState`
- Toast/success feedback: use a simple state-based banner (green bg, auto-dismiss after 3s)
