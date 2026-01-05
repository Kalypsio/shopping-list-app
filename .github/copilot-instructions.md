<!-- Generated/updated by AI assistant -->
# Copilot instructions for contributors

Purpose
- Help AI coding agents and contributors get productive quickly in this Next.js app (App Router + TypeScript + Tailwind).

Big picture
- This is a Next.js app using the app directory (server / client React components) and TypeScript. See [app/layout.tsx](app/layout.tsx) and [app/page.tsx](app/page.tsx) for the root layout and the landing page.
- Build/runtime: Next 16 (app router), React 19. UI styling uses Tailwind + `app/globals.css`.
- Auth/integration: the project depends on `@clerk/nextjs` for auth. Static assets live in `public/`.

Key files & where to make changes
- App entry & routes: modify files under `app/`. Edit [app/page.tsx](app/page.tsx) to change the home UI.
- Global layout & fonts: [app/layout.tsx](app/layout.tsx) contains root layout and font setup via `next/font`.
- Config & types: [next.config.ts](next.config.ts) and [tsconfig.json](tsconfig.json) control build/runtime behavior and path aliasing (`@/* -> ./*`).
- Scripts & dependencies: see [package.json](package.json) for `dev`, `build`, `start`, and `lint` commands.

Developer workflows
- Run dev server: `npm run dev` (ports default to 3000). See [README.md](README.md) for quick start.
- Build for production: `npm run build` then `npm run start`.
- Linting: `npm run lint` runs ESLint (configured via `eslint-config-next`).
- Local secrets: environment overrides go in `.env.local` (do not commit). Auth keys for Clerk typically belong there.

Project-specific conventions
- Uses the Next.js App Router (not `pages/`). Prefer colocated components under `app/` and default server components unless `"use client"` is required.
- TypeScript: `strict: true`. Keep types explicit where possible. Path alias `@/*` maps to project root (see [tsconfig.json](tsconfig.json)).
- Styling: Tailwind v4 + PostCSS. Global styles are in [app/globals.css](app/globals.css).
- Fonts: uses `next/font` (Geist family) in `app/layout.tsx`; prefer that pattern for adding optimized fonts.

Integration & external services
- Clerk: `@clerk/nextjs` is included — check `.env.local` for API keys and Clerk configuration. Authentication usage will typically be in route components or layout wrappers.
- Deploy: project is set up to deploy to Vercel; Next.js conventions and `next build` are sufficient for production.

Patterns & examples
- Server vs client: default to server components in `app/`. When using hooks or browser-only APIs, add `"use client"` at the top of the file and keep client components small.
- Root metadata: see `export const metadata = { ... }` in [app/layout.tsx](app/layout.tsx) for page metadata examples.
- Static assets: import images from `public/` (e.g., `/next.svg`) and use `next/image` for optimization.

What to avoid / watchouts
- Do not create a `pages/` directory — this repo uses the App Router; mixing routers can confuse routing behavior.
- Keep secrets in `.env.local`; do not commit them.
- TypeScript is strict; run the app locally after type changes to catch build-time issues.

If you need more
- Check the root [README.md](README.md) for basic commands.
- If you want me to expand examples (auth integration, adding routes, or CI config), say which area to document.

-- end
