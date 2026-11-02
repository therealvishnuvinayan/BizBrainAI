# BizBrain AI — Frontend V1

A responsive, light-theme business intelligence frontend based on the supplied welcome, overview, and investigation designs. This is a **frontend demonstration with synthetic data**, not a live AI platform.

## Run locally

Use Node.js 20.9+ (Node 22 LTS recommended) and npm. Dependencies are installed and pinned in `package-lock.json`.

```sh
npm ci
npm run dev
```

Open <http://localhost:3000>. Choose **Explore Demo Workspace**; no account or environment variables are needed.

```sh
npm run lint       # ESLint, including accessibility and React rules
npm run typecheck  # App Router route types and strict TypeScript
npm run build     # Production build
npm start         # Serve the production build
npm run test:e2e  # Desktop/mobile browser tests against a production build
npm run test:visual # Compare 9 screenshots with the pre-refactor UI
npm run format    # Format project source with Prettier
```

Browser tests use an installed Google Chrome. If Chrome is unavailable, remove `channel: "chrome"` from both Playwright configurations and run `npx playwright install chromium`. Run `npm run build` before the browser tests. Playwright starts and stops its own server on port 3100; reports, traces, and current screenshots go into ignored folders. The visual baselines in `tests/visual/baselines` were captured before the Tailwind refactor; review any intentional design change before updating them.

## Routes

| Route                       | Purpose                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `/`                         | Welcome, product preview, disabled authentication, demo entry                           |
| `/demo/overview`            | KPIs, revenue and order charts, findings, recent investigations, sample sources, alerts |
| `/demo/investigations/4821` | Complete prepared order investigation, evidence, recommendations, sample tool log       |
| `/demo/investigations`      | Sample investigations and question entry                                                |
| `/demo/connections`         | Clearly labeled simulated source catalog                                                |
| `/demo/knowledge`           | Searchable, expandable sample source records                                            |
| `/demo/history`             | Fixed sample investigation history                                                      |
| `/demo/settings`            | Workspace, appearance, and privacy information                                          |

`/demo` redirects to the overview; unknown routes have a useful not-found page.

## Source structure

```text
src/
  app/
    layout.tsx, page.tsx, globals.css, not-found.tsx, icon.svg
    demo/
      layout.tsx, page.tsx
      overview/page.tsx
      investigations/page.tsx
      investigations/4821/page.tsx
      connections/page.tsx
      knowledge/page.tsx
      history/page.tsx
      settings/page.tsx
  components/
    auth/login-screen.tsx
    dashboard/{dashboard,charts}.tsx
    investigation/investigation-workspace.tsx
    layout/app-shell.tsx
    shared/{question-composer,evidence-dialog,workspace-pages}.tsx
    ui/{brand,primitives,button,card,badge,tone-variants}.tsx
  data/{business,investigation}.ts
  lib/{format,utils}.ts
  types/index.ts
public/images/workspace-preview.png
tests/e2e/workspace.spec.ts
tests/visual/{screens.spec.ts,baselines/}
playwright.config.ts, playwright.visual.config.ts
components.json
```

Routes provide metadata and composition. The shared demo layout owns navigation and search. Feature components own their UI and local interaction state. Typed sample records are kept separately from presentation and formatting. KPIs are derived from the same weekly snapshots used by the charts. Shared UI primitives retain Radix Dialog and Dropdown Menu for focus management, Escape handling, and keyboard navigation.

The application uses Next.js App Router, React, strict TypeScript, Tailwind CSS v4, Lucide icons, and Recharts. The Inter variable font is bundled locally. No runtime font or image service is required. Tailwind utilities own component styling and responsive layouts. `src/app/globals.css` contains shared CSS-variable tokens, global accessibility/reset rules, and one fade animation. All routes are statically prerendered.

`components.json` configures shadcn/ui with Tailwind v4 and the existing aliases. Button, Card, and Badge use locally adapted shadcn composition/variant patterns with the original BizBrain appearance. `cn()` combines `clsx` and `tailwind-merge`; dynamic tones use complete, statically discoverable utility strings. Keep reusable values in the theme, use component utilities for layout, and preserve the existing breakpoint values. See [the styling audit and migration report](docs/styling-refactor.md) for the before/after inventory, remaining custom styling, and visual verification.

For a future FastAPI integration, replace the local data imports at the route/feature boundary with a typed data-access layer, preserving the record IDs and UI types. The current milestone deliberately includes no API routes, authentication provider, persistence, database, LLM SDK, or backend.

## Working interactions

- Demo entry, all sidebar routes, active navigation, mobile drawer, and skip-to-content link.
- Workspace/profile menus, sample notifications, search, and Cmd/Ctrl+K.
- Recharts tooltips and 4-/8-week selectors, plus accessible chart data tables.
- Prepared business questions, question suggestions, and explicit unsupported-question feedback.
- Recent investigation links and the complete order #4821 investigation.
- Expandable timeline events, finding citations, source-record dialogs, and sample tool-result inspection.
- Recommendation details, two supported follow-ups, visit-local bookmarking, copy-link (with manual fallback), and JSON export.
- Sample connection details, operational alert details, knowledge filtering, and empty results.
- Account tabs switch their presentation, while credential fields and authentication actions remain disabled.

### Prepared questions

- Why is order #4821 delayed?
- Why did revenue increase last week?
- Which SKUs are at inventory risk?
- When will stock arrive?
- What should we tell the customer?

Only these prepared intents and a few explicit short aliases are recognized. Other text receives a demo limitation, including arbitrary questions that merely mention order 4821. No generated answer or tool execution is fabricated.

## Sample scenario and metric definitions

The fictional snapshot is fixed at **November 24, 2026**; it does not follow the wall clock. The revenue and order KPIs show the latest week, compared with the previous week. Revenue is $428,310 versus $398,842 (+7.4%); 12,480 of 12,946 orders were fulfilled on time (96.4%). The remaining 3.6% are delayed. There are 24 at-risk SKUs out of 353 (6.8%). The stock alerts show the three most urgent items.

Order #4821 was created November 17. Allocation of ST-200 failed November 18 because available stock was zero. Partial shipment is not permitted. The November 22 dispatch promise was missed, so it is two days overdue in the November 24 snapshot. Twelve incoming units are expected November 25 and already backordered. A November 26 dispatch is a suggestion pending receipt, not a confirmed promise. Findings reference the order, allocation, inventory, and fulfillment records.

All business records, customers, dates, source statuses, insights, activity durations, and history are fictional. Source logos are lightweight approximations. No Shopify, NetSuite, ShipStation, or Google Analytics account is connected. No analytics tracking or external requests are made by the demo flows. Bookmark state lasts only while the investigation component is mounted; no durable activity history is recorded.

## Differences from the image references

- Clear demo labels replace live/healthy integration claims and live-update timestamps.
- Authentication is visibly unavailable; fields cannot accept or transmit credentials.
- The order timeline and weekly metric comparisons were reconciled to make the scenario consistent.
- Findings include source-record citations and timeline events expand into inspectable data.
- Added chart tables, question suggestions, useful supporting routes, and accessible dialogs.
- The avatar uses initials; brand and source marks are CSS/SVG approximations.
- Cards reflow on tablet/mobile, with navigation in a drawer and horizontal scrolling confined to wide tables.
- The welcome preview is captured from the implemented dashboard.

## Verification and dependency notes

The browser suite exercises the three primary pages at 1440×960 and 390×844, checks page overflow and runtime errors, and runs axe WCAG 2 A/AA and 2.1 AA checks. It also checks demo navigation, disabled credential controls, chart filtering, supported/unsupported questions, expandable evidence, follow-ups, bookmarks, exports, record filtering, and global search.

Verified results: lint, strict TypeScript, and the production build pass. Playwright reports **25 passed, 1 intentionally skipped** (the tablet check runs once, not again in the mobile project). The three primary screens were visually reviewed at desktop, 834×1112 tablet, and mobile sizes. The supporting routes and source-record dialog also pass the automated accessibility checks. Dialogs restore keyboard focus after Escape, and page widths stay within the viewport. These automated checks supplement visual review; they are not a complete accessibility certification.

`typescript-eslint` is pinned with an override to 8.48.1 for compatibility with Node 22.12 and TypeScript 5.9. The current newer transitive version requires Node 22.13+. The installed lint tooling reports 16 moderate development-only advisories stemming from `minimatch`. The suggested forced fix downgrades ESLint/Next lint configuration to incompatible major versions, so it is not applied. Runtime dependencies report no known vulnerabilities at verification time. Recheck dependency advisories before publishing.

No commits, pushes, or deployment were created during the styling refactor. Existing staged work was left untouched.
