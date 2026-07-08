# Placement Tracker Pro

Placement Tracker Pro is planned as an incremental production-grade application.

## Stages

1. Placement Tracker MVP
2. Intelligent Learning System
3. AI Platform
4. Complete Placement Ecosystem

## Architecture

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, JWT, bcrypt
- Structure: separated frontend and backend workspaces
- Principle: future stages extend existing modules instead of replacing them

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/FUTURE_STAGES.md](docs/FUTURE_STAGES.md).

## Setup

Copy environment files. The backend will fail startup validation if `backend/.env`
does not define `DATABASE_URL` and `JWT_SECRET`.

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

For Windows PowerShell:

```powershell
Copy-Item frontend\.env.example frontend\.env
Copy-Item backend\.env.example backend\.env
```

The Stage 1 backend expects PostgreSQL database `placement_tracker_pro` by
default:

```bash
createdb -U postgres placement_tracker_pro
```

If your local PostgreSQL password is not `postgres`, update the password portion
of `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/placement_tracker_pro?schema=public
```

Install dependencies:

```bash
npm install
```

Run Prisma migrations:

```bash
npm run prisma:migrate --workspace backend
npm run prisma:generate --workspace backend
```

Start both development servers:

```bash
npm run dev
```

Or start them separately:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:5000`.
