# SauceDemo Automation Suite

**Test Automation Engineer Take-Home Assignment**
**Author:** Rijo Johnson | **Framework:** Playwright + TypeScript | **Pattern:** Page Object Model

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (first time only)
npx playwright install chromium

# 3. Run all tests (headless)
npm test

# 4. Run with browser visible
npm run test:headed

# 5. View HTML report after run
npm run test:report
```

> **Node version:** 18+ required

> **TypeScript + Node types:** If you see `Cannot find name 'process'` in `playwright.config.ts`, run:
> ```bash
> npm i --save-dev @types/node
> ```
> Then add `"types": ["node"]` inside `compilerOptions` in your `tsconfig.json`.

---

## Project Structure

```
saucedemo-automation/
├── pages/                    # Page Object classes
│   ├── LoginPage.ts          # Login screen interactions + assertions
│   ├── InventoryPage.ts      # Product listing page
│   ├── CartPage.ts           # Shopping cart page
│   └── CheckoutPage.ts       # All three checkout steps
├── tests/                    # Test specs (one file per feature area)
│   ├── auth.spec.ts          # 10 authentication tests
│   └── checkout.spec.ts      # 11 checkout + cart tests
├── utils/
│   └── testData.ts           # Centralized constants: users, products, messages
├── playwright.config.ts      # Runner config: baseURL, reporter, retry policy
├── tsconfig.json
└── package.json
```

---

## Test Coverage Summary

| Suite | Tests | What it covers |
|---|---|---|
| `auth.spec.ts` | 10 | Login happy path, invalid creds, locked user, empty fields, error dismissal, auth guard |
| `checkout.spec.ts` | 11 | Full E2E purchase, multi-item, cart badge, price parity, form validation, cancel flow |
| **Total** | **21** | |

---

## Part 1 — Test Strategy

### What I chose to focus on and why

I selected **Login**, **Cart Management**, and **Checkout** as the core flows to automate. These three areas form the critical revenue path in any e-commerce application: a user who cannot log in, cannot add items, or cannot complete a purchase represents a direct business failure. Bugs here are immediately customer-visible and high-severity.

This mirrors how I'd triage automation priority on a production system: map test effort to business risk, not to feature count.

### What I chose not to cover and why

| Area | Reason excluded |
|---|---|
| Product sorting/filtering | UI-only, no state mutation — low risk, manual spot-check sufficient |
| Product detail pages | Read-only display, no transactional risk in this scope |
| Performance / load testing | Requires a dedicated tool (k6, Locust) — out of scope for this timeframe |
| Visual regression | Needs a diffing tool like Percy — manual review is more appropriate here |
| Cross-browser | Chromium covers the primary path; expanding to Firefox/WebKit is a CI config change only |
| Accessibility | Requires axe-core integration and a human reviewer — automation alone is insufficient |

### What belongs in automation vs other testing types

**Automate:**
- Repetitive happy-path flows that run on every deployment (login, checkout)
- Negative scenarios with deterministic expected outputs (error message text, redirects)
- State validation (cart badge count, price consistency)
- Regression coverage for previously defect-prone flows

**Do not automate (use manual or specialised tools):**
- Exploratory testing — machines cannot discover what they weren't told to look for
- UX and visual quality — subjective judgment requires a human
- Accessibility — WCAG compliance needs human interpretation alongside axe-core
- One-off investigations — automation ROI requires repetition

### Risks I considered

| Risk | Mitigation |
|---|---|
| Hardcoded test credentials in source | Acceptable for a public demo app. In production: `.env` file + CI secrets manager (GitHub Secrets / AWS SSM) |
| Selector brittleness on SPA re-renders | Used `data-test` attributes throughout — these are explicitly maintained by SauceDemo as stable automation hooks |
| Flaky timing on cart badge updates | Playwright's built-in auto-wait handles DOM updates without explicit sleeps |
| Test data isolation | SauceDemo resets session state on each login, so tests are naturally isolated without teardown steps |
| `problem_user` produces broken images | Intentional — this user is a known defect scenario. Out of scope for this assignment but documented for awareness |

---

## Part 3 — AI Usage Summary

### How I used AI (Claude) during this exercise

I used Claude as a pairing partner across three distinct phases:

**1. Boilerplate scaffolding**
I asked Claude to generate the initial Page Object class structure with TypeScript types and Playwright locator patterns. This saved roughly 30–40 minutes of repetitive setup work across four page files.

**2. Test case ideation**
I prompted Claude with the SauceDemo feature areas and asked it to suggest edge cases I might have missed. It surfaced the empty-field-by-field validation tests (missing first name, missing last name, missing postal code as separate cases) which I had initially planned to cover as a single test. Splitting them was the right call.

**3. README and strategy drafting**
I used Claude to produce a first-pass outline of the test strategy and README structure, which I then rewrote entirely to reflect my actual decisions and rationale.

### Where it helped

- Speed on repetitive structural code (Page Object constructors, locator declarations)
- Suggesting test cases from a requirements list
- Formatting and organising documentation

### Where it was incomplete or incorrect

- **Selector errors:** Claude suggested `page.locator('.cart-badge')` for the cart badge — this is wrong. The actual selector is `.shopping_cart_badge`. I caught this by running the test and inspecting the DOM in DevTools before committing.
- **URL assumptions:** Claude initially used `/inventory` as the inventory URL. The correct path is `/inventory.html`. A small mistake but one that would have caused every navigation assertion to fail silently if not caught.
- **Over-engineered assertions:** Claude's first draft used `page.waitForSelector()` throughout instead of Playwright's built-in `expect(locator).toBeVisible()`. I refactored all assertions to use the `@playwright/test` expect API, which is more readable and provides better failure messages.

### How I validated AI-generated output

Every line of generated code was:
1. Run against the live SauceDemo site before being committed
2. Selectors cross-checked in browser DevTools (Elements panel)
3. Assertion messages verified by intentionally breaking a test to confirm the failure output was meaningful
4. Reviewed for pattern consistency with the rest of the codebase (naming, locator strategy, assertion style)

My rule: AI is a fast first draft. Every line I ship, I own.

---

## CI & Sauce Labs Integration

This suite ships with a GitHub Actions workflow (`.github/workflows/ci.yml`) that triggers on every push and pull request to `main`. It installs dependencies, downloads Chromium, runs the full test suite, and uploads the HTML report as a build artifact retained for 7 days.

For production CI, the suite is designed to integrate with **Sauce Labs** via [`saucectl`](https://docs.saucelabs.com/dev/cli/saucectl/). GitHub Actions triggers the run; Sauce Labs provides cross-browser parallelisation across Chrome, Firefox, and Safari, plus a persistent test dashboard with video replay and failure history.

```yaml
# Example saucectl integration step (requires SAUCE_USERNAME + SAUCE_ACCESS_KEY secrets)
- name: Run on Sauce Labs
  run: npx saucectl run --config .sauce/config.yml
```

---

## What I'd add with more time

- **API-layer auth** — use `request` fixture to obtain session cookies, bypass login UI for tests that don't test login itself (speeds up the suite 30–40%)
- **Visual regression with Percy** — screenshot comparison on inventory and checkout summary pages
- **`problem_user` defect suite** — document the known broken behaviours as tracked bugs with `test.skip` annotations
- **Reporting integration** — push HTML reports to GitHub Pages on main branch merges so the team has a permanent test history URL
