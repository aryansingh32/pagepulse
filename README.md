# Page Pulse

Page Pulse audits any public website: drop in a URL and get its HTTP status, response
time, page title, meta description, H1 count, images missing alt text, and an
approximate word count — all in one clean, responsive report.

Built for **Digital Heroes Training Task** — https://digitalheroesco.com

---

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Running locally](#running-locally)
- [Environment variables](#environment-variables)
- [API documentation](#api-documentation)
- [Deploying to Cloudflare](#deploying-to-cloudflare)
- [Security notes](#security-notes)
- [Future improvements](#future-improvements)

---

## Overview

Page Pulse is a small monorepo with two deployables:

- **`apps/frontend`** — a React 19 + Vite single-page app that collects a URL,
  calls the API, and renders the audit as a set of metric cards. Ships to
  **Cloudflare Pages**.
- **`apps/backend`** — a Hono API running on **Cloudflare Workers**. It fetches
  the target page server-side (avoiding browser CORS/CORB limits), parses the
  HTML with the streaming `HTMLRewriter` API, and returns a small JSON report.

A shared `packages/shared` package holds the TypeScript types and constants
both sides depend on, so the request/response contract can never silently
drift between frontend and backend.

## Architecture

```
┌──────────────────┐        POST /api/analyze        ┌───────────────────┐
│  Frontend (SPA)   │ ───────────────────────────────▶│  Backend (Worker)  │
│  Cloudflare Pages │                                  │ Cloudflare Workers │
│  React + Vite     │◀─────────────────────────────────│  Hono + HTMLRewriter│
└──────────────────┘        { httpStatus, ... }        └─────────┬─────────┘
                                                                   │ GET (server-side fetch,
                                                                   │ 8s timeout, 2MB cap,
                                                                   │ SSRF-guarded)
                                                                   ▼
                                                          ┌────────────────┐
                                                          │  Target website │
                                                          └────────────────┘
```

The Worker never trusts the caller: every URL is validated and screened for
SSRF risk before any outbound `fetch` happens (see [Security notes](#security-notes)).

## Folder structure

```
page-pulse/
├── apps/
│   ├── frontend/                 # React + Vite + Tailwind + shadcn/ui SPA
│   │   ├── src/
│   │   │   ├── components/       # Hero, UrlForm, ReportGrid, states, ui/ primitives
│   │   │   ├── hooks/            # useTheme
│   │   │   ├── lib/              # apiClient, validation (zod), utils
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/                # favicon, _redirects (SPA fallback)
│   │   ├── index.html
│   │   └── vite.config.ts
│   └── backend/                  # Hono API on Cloudflare Workers
│       ├── src/
│       │   ├── routes/analyze.ts
│       │   ├── lib/              # validateUrl (SSRF guard), fetchWithTimeout,
│       │   │                     # readBodyWithLimit, analyzeHtml (HTMLRewriter)
│       │   └── index.ts
│       └── wrangler.toml
├── packages/
│   └── shared/                   # Shared TypeScript types & constants
├── pnpm-workspace.yaml
└── package.json
```

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui-style
components, React Hook Form, Zod, Lucide React icons.

**Backend:** Cloudflare Workers, Hono, TypeScript, the HTMLRewriter streaming
parser, native `fetch`/`AbortController`.

**Tooling:** pnpm workspaces (monorepo), Wrangler.

## Getting started

### Prerequisites

- Node.js ≥ 18.17
- [pnpm](https://pnpm.io/) ≥ 9 (`corepack enable` will provide it automatically)
- A free [Cloudflare account](https://dash.cloudflare.com/sign-up) for deployment

### Install

```bash
pnpm install
```

This installs dependencies for every workspace (`frontend`, `backend`,
`shared`) in one pass.

## Running locally

Run the backend and frontend in two terminals:

```bash
# Terminal 1 — API on http://127.0.0.1:8787
pnpm dev:backend

# Terminal 2 — app on http://localhost:5173
pnpm dev:frontend
```

The Vite dev server proxies `/api/*` to `http://127.0.0.1:8787`, so the
frontend works out of the box with no extra configuration. Open
`http://localhost:5173` and analyze a URL, e.g. `https://example.com`.

## Environment variables

| Variable            | App      | Where               | Purpose                                                                 |
| -------------------- | -------- | -------------------- | ------------------------------------------------------------------------ |
| `ALLOWED_ORIGINS`     | backend  | `wrangler.toml [vars]` | Comma-separated list of origins allowed by CORS.                        |
| `VITE_API_BASE_URL`   | frontend | `.env` (see `.env.example`) | Base URL of the deployed Worker. Leave unset for local dev (uses the Vite proxy). |

## API documentation

### `POST /api/analyze`

**Request body**

```json
{ "url": "https://example.com" }
```

**Success response — `200 OK`**

```json
{
  "httpStatus": 200,
  "responseTime": 183,
  "title": "Example Domain",
  "metaDescription": null,
  "h1Count": 1,
  "imagesMissingAlt": 0,
  "wordCount": 28,
  "finalUrl": "https://example.com/"
}
```

**Error responses**

| Status | Meaning                                          |
| ------ | ------------------------------------------------- |
| `400`  | Missing/invalid URL, disallowed protocol, blocked host, URL too long |
| `413`  | Target page exceeds the 2MB size limit             |
| `415`  | Target URL did not return an HTML document         |
| `502`  | DNS failure, SSL error, redirect loop, network error |
| `504`  | Target server did not respond within 8 seconds     |

```json
{ "error": "Request timed out." }
```

### `GET /api/health`

Returns `{ "status": "ok", "timestamp": "..." }`. Useful for uptime checks.

## Deploying to Cloudflare

### 1. Backend — Cloudflare Workers

```bash
cd apps/backend
pnpm dlx wrangler login          # first time only
pnpm deploy                      # wrangler deploy
```

Update `ALLOWED_ORIGINS` in `wrangler.toml` (or `[env.production.vars]`) to
match your deployed Pages domain before going live, then note the Worker URL
Wrangler prints (`https://page-pulse-api.<subdomain>.workers.dev`).

### 2. Frontend — Cloudflare Pages

```bash
cd apps/frontend
cp .env.example .env
# set VITE_API_BASE_URL to the Worker URL from step 1
pnpm deploy                      # builds, then `wrangler pages deploy dist`
```

Or connect the repo in the Cloudflare Pages dashboard with:

- **Build command:** `pnpm install && pnpm --filter @page-pulse/frontend build`
- **Build output directory:** `apps/frontend/dist`
- **Environment variable:** `VITE_API_BASE_URL` = your Worker URL

`public/_redirects` ships a SPA fallback so client-side routes don't 404 on
refresh.

## Security notes

- **SSRF protection:** requests to `localhost`, loopback/private/link-local
  IPv4 and IPv6 ranges, and common internal hostname suffixes
  (`.local`, `.internal`, …) are rejected before any fetch is made.
- **Protocol allowlist:** only `http:` and `https:` are accepted;
  `javascript:`, `data:`, `file:`, and `ftp:` are always rejected.
- **Timeouts:** every outbound fetch is aborted after 8 seconds via
  `AbortController`.
- **Size limits:** response bodies are streamed with a running byte count and
  aborted past 2MB, so a huge or slow-loris response can't exhaust memory.
- **No crashes:** every failure mode (timeout, DNS, TLS, redirect loop,
  non-HTML content, oversized body) is caught and mapped to a proper HTTP
  status and JSON error body.

## Future improvements

- Persist audit history per URL (e.g. Cloudflare D1 or KV) and show trends over time.
- Add Lighthouse-style performance and Core Web Vitals scoring.
- Crawl and audit multiple pages of a site in one run.
- Add automated tests (Vitest + Miniflare) for the validation and parsing utilities.
- Rate limit `/api/analyze` per IP to protect against abuse.
