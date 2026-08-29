# KaamKhojo

KaamKhojo helps customers find trusted nearby technicians and mechanics, while giving local professionals a focused workspace for upcoming jobs.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/kaamkhojo/src/pages/KaamPages.tsx` — routed landing, auth, role selection, dashboard, and profile screens.
- `artifacts/kaamkhojo/src/components/kaam/KaamComponents.tsx` — shared brand, shell, responsive navigation, cards, rows, and feedback components.
- `lib/api-spec/openapi.yaml` — source of truth for marketplace, dashboard, and profile API contracts.
- `artifacts/api-server/src/routes/` — Express route handlers for the API contract.
- `lib/db/src/schema/marketplace.ts` — Drizzle schema for profiles, service categories, technicians, and service requests.

## Architecture decisions

- The first release uses a demo profile and seeded PostgreSQL data so all role flows feel populated without local authentication.
- Wouter owns the small route surface; shared shell components keep customer and technician navigation consistent across mobile and desktop.
- API contracts are generated from OpenAPI and consumed through `@workspace/api-client-react`; the UI retains graceful demo fallbacks for an empty or unavailable API.
- Payments and real-time chat are intentionally excluded from the initial architecture.

## Product

- Customers can browse service categories, search nearby technicians, view active/recent requests, and edit their profile.
- Technicians can review upcoming jobs, earnings, ratings, profile views, and update their public profile.
- Visitors can move through landing, login, registration, and role selection before entering a role-specific dashboard.

## User preferences

- Mobile-first, clean modern Indian marketplace UI.
- Keep payments and real-time chat out of the initial build.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
