# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database (projects/contacts)**: Supabase (PostgreSQL) — `@supabase/supabase-js`
- **Database (analytics/comments/notifications)**: PostgreSQL + Drizzle ORM (Replit-managed)
- **Media storage**: Cloudinary (video/image uploads via signed browser uploads)
- **Validation**: Zod, `drizzle-zod`
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   ├── infinity-tech/      # Portfolio frontend (port assigned by Replit)
│   ├── admin-dashboard/    # Admin frontend (port assigned by Replit)
│   └── mockup-sandbox/     # Canvas component previews
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/                 # Drizzle ORM schema + DB connection (Replit Postgres)
├── scripts/                # Utility scripts
├── supabase_schema.sql     # One-time SQL run in Supabase to create tables
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## Database

> **Supabase has been disabled.** All data (projects, contact messages) is now stored in the Replit-managed PostgreSQL database via Drizzle ORM. The `@workspace/db` package contains the full schema. Run `pnpm --filter @workspace/db run push` to apply schema changes.

## Supabase Setup (DISABLED)

- **Project ref**: `kbqhoyipoxmyhtbuhlkd`
- **Host**: `db.kbqhoyipoxmyhtbuhlkd.supabase.co`
- **Tables**: `projects`, `contact_messages`
- **Columns (projects)**: `id, title_en, title_ar, description_en, description_ar, overview_en, overview_ar, problem_en, problem_ar, solution_en, solution_ar, thumbnail_url, video_url, assets_zip_url, tags, status, github_url, live_link, category, language, code_snippet, timeline, files, media, updates, created_at, updated_at`
- **RLS**: Public SELECT on `projects`; service_role only for writes; service_role only for `contact_messages`
- **Schema creation**: Done via Supabase Management API (PAT in `SUPABASE_ACCESS_TOKEN`)
- **Admin writes**: Go through `api-server` using `SUPABASE_SERVICE_ROLE_KEY`
- **Frontend reads**: Direct Supabase client using `VITE_SUPABASE_ANON_KEY`
- **Direct psql (port 5432/6543)**: BLOCKED by Replit's network firewall — always use REST API or `@supabase/supabase-js`
- **Connection string** (for external tools only): `postgresql://postgres:[SUPABASE_DB_PASSWORD]@db.kbqhoyipoxmyhtbuhlkd.supabase.co:5432/postgres`
- **Agent skills**: `supabase/agent-skills` installed via `npx skills add supabase/agent-skills`

## Required Secrets

| Secret | Used By |
|---|---|
| `SUPABASE_URL` | api-server |
| `SUPABASE_SERVICE_ROLE_KEY` | api-server |
| `SUPABASE_ANON_KEY` | api-server |
| `VITE_SUPABASE_URL` | frontend (infinity-tech, admin-dashboard) |
| `VITE_SUPABASE_ANON_KEY` | frontend |
| `CLOUDINARY_CLOUD_NAME` | api-server |
| `CLOUDINARY_API_KEY` | api-server |
| `CLOUDINARY_API_SECRET` | api-server |
| `VITE_CLOUDINARY_CLOUD_NAME` | frontend |
| `SUPABASE_DB_PASSWORD` | setup script (schema migration) |
| `SUPABASE_ACCESS_TOKEN` | setup script (Management API) |
| `ADMIN_PIN` | api-server (default: `admin2024`) |

## Artifacts

### `artifacts/infinity-tech` — Portfolio Website (`/`)

- **Pages**: Home, Projects, Project Detail, About, Contact
- **Admin Panel**: PIN-protected at `/admin`
- **Data**: Reads from Supabase directly (anon key, public RLS)
- **API proxy**: Vite dev server proxies `/api` → `http://localhost:8080`
- **Contact form**: Posts to `/api/contact` → stored in `contact_messages`
- **Analytics**: Fire-and-forget events to `/api/analytics/event`
- **Comments**: Per-project at `/api/comments/:id`

### `artifacts/admin-dashboard` — Admin Dashboard (`/admin-dashboard`)

- **Auth**: PIN-protected via `x-admin-pin` header (`localStorage` key `it-admin-pin`)
- **Projects CRUD**: Via API server (POST/PATCH/DELETE `/api/projects`)
- **Reads**: Direct from Supabase (anon key) — bypasses API server for listing
- **Cloudinary uploads**: Signed via `/api/projects/upload-signature`, then direct browser → Cloudinary
- **API proxy**: Vite dev server proxies `/api` → `http://localhost:8080`

### `artifacts/api-server` — Express API (port 8080)

Routes:
- `GET/POST /api/projects` — project CRUD (POST/PATCH/DELETE require `x-admin-pin`)
- `PATCH/DELETE /api/projects/:id`
- `POST /api/projects/upload-signature` — Cloudinary signed upload
- `POST /api/contact` — stores contact form in Supabase `contact_messages`
- `POST /api/analytics/event` — stores events in Replit Postgres
- `GET /api/analytics/summary` — aggregated stats
- `GET/POST/PATCH/DELETE /api/comments/:projectId`
- `GET/PATCH /api/notifications`
- `POST /api/setup/schema` — one-time schema bootstrap (admin-protected)
- `GET /api/healthz`
- `GET /api/push/vapid-public-key` — returns VAPID public key for browser subscription
- `POST /api/push/subscribe` — save/upsert a browser PushSubscription (admin-protected)
- `DELETE /api/push/subscribe` — remove a subscription by endpoint (admin-protected)
- `POST /api/push/test` — broadcast a test push to all subscriptions (admin-protected)

Security:
- **Helmet** — secure HTTP headers
- **CORS** — restricted to `*.replit.app`, `*.replit.dev`, `localhost`
- **Rate limiting** — 200 req/15 min global; 30 writes/min on projects
- **Input sanitization** — allowlist of writable fields on PATCH `/api/projects`
- **Body size limit** — 1 MB

## Translation System

**File**: `artifacts/api-server/src/lib/translate.ts`

Two-layer pipeline used on every `POST /api/projects` and `PATCH /api/projects/:id` write when only one language is provided:

| Layer | Tool | Notes |
|---|---|---|
| Layer 1 | OpenAI `gpt-5-mini` | Context-aware, engineering-domain system prompt; acronyms (PCB, RTOS, I2C …) kept in Latin script |
| Fallback | MyMemory MT | Used only when OpenAI call fails |
| Fallback layer 2 | Engineering dictionary | 60+ term overrides applied on top of MyMemory output only |
| Cache | In-process LRU (2 000 entries) | Keyed by `{lang}→{lang}:{text}`; cleared between server restarts |

**Manual override**: If both `title_en` and `title_ar` (or any `*_en`/`*_ar` pair) are supplied in the request body, the pipeline is skipped entirely for that field — the provided values are saved verbatim.

**Env vars** (auto-provisioned by Replit AI Integrations — no user action needed):
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_OPENAI_API_KEY`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` (`composite: true`). Build order:
1. `pnpm run typecheck` — `tsc --build --emitDeclarationOnly`
2. `pnpm --filter @workspace/api-server run build` — esbuild bundle

## Workflows

| Workflow | Command | Port |
|---|---|---|
| API Server | `PORT=8080 pnpm --filter @workspace/api-server run dev` | 8080 |
| Start application | `PORT=21976 BASE_PATH=/ pnpm --filter @workspace/infinity-tech run dev` | 21976 |
| artifacts/admin-dashboard | `pnpm --filter @workspace/admin-dashboard run dev` | 22133 |
| artifacts/infinity-tech | `pnpm --filter @workspace/infinity-tech run dev` | 21976 |

Note: `artifacts/api-server` and `Start application` conflict with the primary workflows — they are expected to fail.
