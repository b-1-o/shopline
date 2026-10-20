# Shopline

**Plan meals around your budget. Build one grocery list. Decide where to shop.**

Shopline is a responsive, no-account grocery-planning beta built with React, TypeScript and Vite. It turns a budget, ZIP code, household size, dietary preference and planning window into a meal plan and consolidated basket.

## Beta features

- Budget-aware meal planning for 3, 5 or 7 dinner ideas.
- Dietary filters, adjustable household size and store / pickup / delivery intent.
- Recipe cards with preparation steps, estimated cooking times and ingredient lists.
- Consolidated shopping list with package estimates, quantity edits, check-off state and text export.
- Nearby-store discovery links based on the ZIP code you choose.
- Local browser persistence; no account or personal profile is required.
- Server-side Kroger API adapter for live product-price lookups once valid credentials are configured.
- An anonymous-session boundary and profile types are prepared for a future account implementation; there is no registration or login UI in this beta.

## Price transparency

The included sample catalog contains **indicative planning estimates**, not live quotes. Retail prices, package size, promotions, delivery fees, taxes and stock vary by retailer and store. The app does not label the fallback catalog as live or guaranteed.

For live Kroger product lookups, configure KROGER_CLIENT_ID and KROGER_CLIENT_SECRET as server-side environment variables in your Vercel project. Do not put these secrets in browser-side VITE_ variables. The API route searches the nearest returned Kroger location and reads the current prices supplied by Kroger at request time. Availability depends on API account access, store coverage and provider limits.

Official references:
- Kroger Public APIs: https://www.postman.com/kroger/the-kroger-co-s-public-workspace/overview
- Kroger product and store-specific pricing overview: https://www.postman.com/kroger/the-kroger-co-s-public-workspace/documentation/ki6utqb/kroger-public-apis
- Instacart Developer Platform (a possible future recipe / retailer / marketplace integration; API key access is required): https://docs.instacart.com/developer_platform_api

This beta does **not** place orders or guarantee a checkout price. Shopping buttons open external discovery/search pages; users review the retailer's own basket before purchasing.

## Run locally

Requires Node.js 20 or newer.

1. Install dependencies with npm install.
2. Start the frontend with npm run dev.
3. Run tests with npm test.
4. Build production assets with npm run build.

Copy .env.example to .env.local only if you intend to configure the server-side retail adapter. Vite itself does not execute the Vercel api/ route locally; use vercel dev for local API testing after installing the Vercel CLI.

## Deploy

Deploy the repository to Vercel. Vercel serves the Vite build from dist and detects api/prices.ts as a serverless function. Add the Kroger credentials under Project Settings → Environment Variables, redeploy, then confirm /api/prices?action=status reports live-available.

GitHub Actions runs unit tests and a production build on pushes and pull requests to main.

## Product boundaries

- All beta preferences and basket data stay in the browser's local storage. Clearing browser storage removes the saved plan.
- No identity, payment or order data is collected.
- Account types are a future extension seam only; account creation is intentionally not enabled.
- Live offer comparison across multiple retailers, store-specific inventory for every ingredient, loyalty pricing, and retailer checkout integrations need further provider approvals and integrations.

## Stack

React · TypeScript · Vite · Lucide · Vercel Functions · Vitest