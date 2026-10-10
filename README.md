# hextorq-LABS — Nexus Client Collaboration SaaS Platform

A unified, production-oriented client collaboration platform built for high-velocity software agencies and their clients. Nexus brings project management, Vercel staging preview registration, interactive visual feedback pin annotations, ticket tracking, encrypted file storage, LiveKit video meetings, milestone escrow sign-offs, and payment processing into a single multi-tenant workspace.

---

## 1. System Architecture & Features

### Core Capabilities
- **Agency Operations HQ (`/agency/dashboard`)**:
  Real-time project health, client directory, team RBAC, active staging previews, overdue deliverables, scheduled meetings, and billing metrics.
- **Client Dedicated Portal (`/portal/dashboard`)**:
  Strictly isolated tenant portal where client stakeholders can review staging previews, pin feedback, track issue resolutions, review documents, and approve milestone sign-offs.
- **Visual Review Studio & Preview Engine (`/agency/projects/:id/feedback`, `/portal/projects/:id/feedback`)**:
  - Viewport switcher (1440px desktop, 768px tablet, 375px mobile, responsive).
  - Pin-point visual feedback engine with normalized `(x%, y%)` coordinates, DOM element selector capture, device context, and priority tags.
  - Interactive discussion threads with internal-only agency privacy toggles.
  - 1-Click "Convert to Ticket" to push feedback directly into development sprint boards.
- **Cross-Origin Feedback SDK (`public/feedback-sdk.js`)**:
  - Standalone script embeddable in staging builds.
  - Strict `postMessage` schema with origin validation.
  - Sanitizes sensitive DOM attributes (scrubs `<input type="password">`, credentials, auth tokens).
- **Vercel Preview Registration & Security Policy (`POST /api/projects/:id/previews`)**:
  - Server-side role enforcement (Agency staff only).
  - Strict host policy verification: rejects arbitrary domains, allowing only approved `.vercel.app` or registered client staging domains.
- **Milestone Digital Approvals (`/portal/projects/:id/approvals`)**:
  - Formal client sign-offs with digital signature verification.
  - Releases escrow and records tamper-proof audit trail with confetti celebration.
- **Billing, Invoices & Escrow Payments (`POST /api/payments/*`)**:
  - Itemized commercial invoices linked to milestones.
  - Server-side payment order generation.
  - Cryptographic HMAC-SHA256 signature verification for Stripe and Razorpay webhooks.
  - Idempotency deduplication preventing replay attacks and duplicate settlements.
- **Encrypted Video Meetings (LiveKit Integration)**:
  - Project-linked scheduling with time-zone awareness.
  - Server-side token generation endpoint (`POST /api/meetings/:id/token`).
  - In-app interactive video room with camera, microphone, screen share, and synchronized live minutes.
- **PostgreSQL Row Level Security (RLS)**:
  - 27 relational tables defined in `supabase/migrations/001_init_schema.sql`.
  - Multi-tenant tenant filtering via `get_user_client_id()`.
  - Client queries cannot access other clients' projects, invoices, or internal discussions.

---

## 2. Interactive Persona Sandbox

The platform includes a zero-mock live persona switcher in the top banner allowing instant testing across all roles:
1. **Alex Rivera (Agency Admin)**: Full administrative workspace access across all clients and projects.
2. **Sarah Chen (Agency Developer)**: Lead frontend engineer access with project management and code reviews.
3. **Marcus Vance (Client: Apex Retail)**: Sandboxed to Apex Retail's projects, staging builds, and invoices.
4. **Elena Rostova (Client: Horizon Fintech)**: Sandboxed to Horizon Fintech's projects and invoices.

---

## 3. Getting Started & Local Setup

### Prerequisites
- Node.js 20+ (tested on Node v24.19.0)
- npm 10+

### Installation
```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local

# Run security and multi-tenant test suite
npx tsx scripts/verify-security.ts

# Start the Next.js App Router development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the landing page and interactive sandbox.

---

## 4. Database Migrations & Supabase Configuration

The full relational schema and PostgreSQL Row Level Security (RLS) policies are located at:
`supabase/migrations/001_init_schema.sql`

To apply to your live Supabase project:
```bash
# Link your project
npx supabase link --project-ref your-project-id

# Apply migrations
npx supabase db push
```

---

## 5. Security & Verification Suite

Run the automated test runner to verify cross-client isolation, internal comment shielding, Vercel host policies, digital sign-offs, and webhook HMAC verification:
```bash
npx tsx scripts/verify-security.ts
```

All 16 security assertions execute and validate tenant boundaries with zero failures.

---

## 6. Environment Configuration

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Base application URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server service role key |
| `ALLOWED_PREVIEW_HOSTS` | Comma-separated list of approved preview domain suffixes (`.vercel.app, .nexus-clients.com`) |
| `STRIPE_SECRET_KEY` | Stripe secret key for server-side checkout orders |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret for HMAC-SHA256 signature verification |
| `LIVEKIT_API_KEY` | LiveKit API Key for video room token signing |
| `LIVEKIT_API_SECRET` | LiveKit API Secret |
| `LIVEKIT_WS_URL` | LiveKit WebSockets cluster URL (`wss://demo.livekit.cloud`) |
