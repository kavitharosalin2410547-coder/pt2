# Environment Configuration

## Frontend

Defined in `frontend/.env`.

- `VITE_API_BASE_URL`: Backend API base URL.

## Backend

Defined in `backend/.env`.

- `NODE_ENV`: Runtime environment.
- `PORT`: API port.
- `DATABASE_URL`: PostgreSQL connection string. Stage 1 uses
  `placement_tracker_pro` by default:
  `postgresql://postgres:postgres@localhost:5432/placement_tracker_pro?schema=public`.
- `JWT_SECRET`: Secret used to sign JWTs. It must be at least 16 characters.
- `JWT_EXPIRES_IN`: JWT lifetime.
- `BCRYPT_SALT_ROUNDS`: Password hashing cost.
- `CORS_ORIGIN`: Allowed frontend origin.

Use `.env.example` files as templates. Do not commit real secrets.

## Local Setup

Create environment files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Windows PowerShell:

```powershell
Copy-Item frontend\.env.example frontend\.env
Copy-Item backend\.env.example backend\.env
```

Create the PostgreSQL database expected by `backend/.env`:

```bash
createdb -U postgres placement_tracker_pro
```

If `createdb` is unavailable, use `psql`:

```bash
psql -U postgres -c "CREATE DATABASE placement_tracker_pro;"
```

Run Prisma migrations from the repository root:

```bash
npm run prisma:migrate --workspace backend
```

Start the backend:

```bash
npm run dev --workspace backend
```

Start the frontend:

```bash
npm run dev --workspace frontend
```

The project does not reference `test_db` in Stage 1 configuration. Use
`placement_tracker_pro` unless you intentionally override `DATABASE_URL`.
