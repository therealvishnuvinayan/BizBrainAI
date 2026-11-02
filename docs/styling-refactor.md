# Tailwind styling audit and refactor

## Initial findings

Tailwind CSS **4.3.3** and `@tailwindcss/postcss` **4.3.3** were installed correctly. `postcss.config.mjs` registered the v4 PostCSS plugin, the root layout imported `globals.css`, and that file imported `tailwindcss` and declared a small `@theme`. A `tailwind.config.js` file is not required for this CSS-first v4 configuration. The production build generated Tailwind styles successfully.

Tailwind supplied Preflight and the `sr-only` utility, but the actual interface relied on **4,291 lines across eight traditional CSS files**. Even `sr-only` was duplicated in the custom stylesheet. Component class names mostly selected rules in `src/styles`; merely installing Tailwind had not made the architecture utility based.

There was no shadcn `components.json`, `cn()` helper, CVA variants, or shadcn component source. Dialog and Dropdown Menu used Radix directly. Radix alone does not establish a shadcn configuration.

| Component area                                      | Before                                                                   | After                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `auth/login-screen.tsx`                             | `auth.css`, base and responsive rules                                    | Tailwind layout, states, inputs and responsive utilities; shared Button     |
| `layout/app-shell.tsx`                              | `app-shell.css`, overlay and responsive rules                            | Tailwind navigation, header, search, drawer and active states               |
| `dashboard/dashboard.tsx`                           | `dashboard.css`, base and responsive rules                               | Tailwind cards, KPIs, findings, tables and alerts; shared Card/Badge/Button |
| `dashboard/charts.tsx`                              | CSS chart containers, legends and selectors; Recharts presentation props | Tailwind containers and controls; chart colors consume shared CSS variables |
| `investigation/investigation-workspace.tsx`         | `investigation.css`, overlay and responsive rules                        | Tailwind progress, findings, timeline, recommendations and tool activity    |
| `shared/question-composer.tsx`                      | Base, overlay and responsive rules                                       | Tailwind focus, suggestions, form and feedback styling                      |
| `shared/evidence-dialog.tsx`                        | Overlay and responsive rules                                             | Tailwind records, source labels and dialog content                          |
| `shared/workspace-pages.tsx`                        | `workspace-pages.css`, base and responsive rules                         | Tailwind supporting routes and shared primitives                            |
| `ui/brand.tsx`, `ui/primitives.tsx`, not-found page | Base and responsive CSS; native SVG                                      | Tailwind styling, shared effect tokens; existing SVG retained               |

## Final architecture

- `src/app/globals.css` is the only authored CSS file: **287 lines**, primarily tokens. All eight obsolete stylesheets were removed after the initial nine screenshot comparisons passed.
- CSS variables define the shared surfaces, foregrounds, semantic tones, borders, focus ring, radii, chart colors, gradients and shadows. Tailwind's `@theme` exposes them to utilities.
- Tailwind utilities colocate layout, spacing, typography, states and responsive behavior with components. Arbitrary values preserve the original precise dimensions. Descendant variants remain where a container styles repeated children or shared component slots; there is no second component stylesheet layer.
- Breakpoints retain the previous layout transitions: `sm` 521px, `md` 761px, `lg` 1024px, `xl` 1280px, `2xl` 1600px. The matching `max-*` variants preserve the original integer viewport boundaries.
- `components.json` configures shadcn/ui for Tailwind v4. Button uses Radix Slot and CVA variants; Card supports semantic `asChild` composition; Badge shares typed tone variants. These are locally adapted shadcn patterns, styled for BizBrain rather than replacing the design with stock defaults. Existing accessible Radix Dialog/Menu behavior is retained.
- `cn()` uses `clsx` and `tailwind-merge`. Colors and background images use distinguishable utilities so gradient composition is not accidentally removed during class merging. Dynamic styles use complete static class maps.
- Tests use accessible roles and stable `data-slot`/`data-control` markers where necessary, instead of depending on obsolete CSS class names.

## Custom styling that remains

Ordinary cards, grids, navigation, responsive layouts, controls and text do **not** require traditional CSS.

The remaining global rules are shared document defaults, control font inheritance, focus outlines, disabled-input rendering, selection, touch behavior, scroll offsets, reduced-motion handling and a single fade-in keyframe. Complex gradient and multilayer shadow values are named theme variables, applied through Tailwind utilities. Tailwind Preflight supplies the main reset; the redundant reset and `sr-only` definition were removed.

Native SVG paths/gradient stops remain for the brand, decorative waves and chart area fills. Recharts' tooltip style object and SVG presentation props remain because they belong to its rendering API; chart series/grid/axis colors read CSS variables. The source mark's inline color still reads the existing mock-data value. These are bounded presentation exceptions, not another stylesheet architecture.

Application state, event-handler behavior, routes, evidence, calculations and mock data were preserved. No backend, authentication or live integration was added.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npm run test:e2e
npm run test:visual
```

Lint, strict TypeScript and the production build pass. The existing browser suite reports **25 passed, 1 intentionally skipped**; the skip avoids running the same tablet check in both browser projects. It covers navigation, charts, supported and unsupported questions, evidence expansion, dialog focus restoration, search, bookmarks, JSON export, overflow and automated accessibility checks.

The visual suite compares the actual pre-refactor frontend against the migrated implementation, rather than comparing to newly generated baselines. It covers login, dashboard and investigation at **1440×960**, **834×1112**, and **390×844**. All **9 comparisons pass**, with reduced motion and a maximum differing-pixel ratio of 0.001. Review was also performed on the before/after screenshots. The original product image references and dashboard preview asset were preserved.

Baseline images are in `tests/visual/baselines/`; current after screenshots and any failure diffs are written to ignored `visual-results/`. Keep the same Chrome/font environment when interpreting visual results. Do not update baselines merely to silence a refactor regression.

| Desktop comparison | Before                                                          | After                                                                                          |
| ------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Login              | [Original](../tests/visual/baselines/login-desktop.png)         | [Migrated](../visual-results/screens-login-at-desktop/login-desktop-after.png)                 |
| Dashboard          | [Original](../tests/visual/baselines/dashboard-desktop.png)     | [Migrated](../visual-results/screens-dashboard-at-desktop/dashboard-desktop-after.png)         |
| Investigation      | [Original](../tests/visual/baselines/investigation-desktop.png) | [Migrated](../visual-results/screens-investigation-at-desktop/investigation-desktop-after.png) |

Both lockfiles include the small shared-component dependencies. Existing staged Git entries were not changed; no commit or push was made.

Implementation references: [Tailwind theme variables](https://tailwindcss.com/docs/theme), [Tailwind responsive variants](https://tailwindcss.com/docs/responsive-design), [shadcn configuration](https://ui.shadcn.com/docs/components-json), [shadcn Radix Button composition](https://ui.shadcn.com/docs/components/radix/button).
