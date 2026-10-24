# Shopline

**Plan meals around your budget. Build one grocery list. Decide where to shop.**

Shopline is a responsive, no-account grocery-planning beta built with React, TypeScript and Vite. It turns a budget, ZIP code, household size, dietary preference and planning window into a meal plan and consolidated basket.

## Beta features

- A guided four-step shopping quiz before each new search: household size, budget, meal window, diet/allergens, home essentials, location and shopping mode.
- A local household profile for recurring shops or a one-time guest shop each time.
- Household essentials alongside food: paper goods, cleaning/laundry, personal care and optional baby/pet products.
- Budget range from $25 to $2,000, with manual ZIP entry or opt-in browser location.
- Separate Plan, Recipes, Grocery list and Nearby shopping screens with animated enter/exit transitions.
- Persistent dark glass theme with berry accents, plus a light theme toggle.
- Dietary filters, adjustable household size and store / pickup / delivery intent.
- Recipe cards with preparation steps, estimated cooking times and ingredient lists.
- Consolidated shopping list with package estimates, per-item store labels when matched, quantity edits, check-off state, complete basket clearing and text export.
- In-app store search, a store-grouped stop list, interactive map and road route when location coordinates and the routing service are available.
- Inline nearby-store discovery and route tools: actions stay inside Shopline rather than sending the user to general search pages.
- Local browser persistence; no account or personal profile is required.
- Server-side Kroger API adapter for live product-price lookups once valid credentials are configured.
- An anonymous-session boundary and profile types are prepared for a future account implementation; there is no registration or login UI in this beta.

## Auth0 accounts and saved Quick list preferences

Shopline uses Auth0 Universal Login for account creation and sign-in. Signed-in preferences are saved to Auth0 `user_metadata.shoplineSettings` and loaded on the next visit or another device. This stores planning settings, not passwords or access tokens: ZIP code, budget, number of days, servings, diet, shopping mode, household shopping categories, allergy filters, items already at home, and optional household flags. The guest planner remains available when Auth0 is not configured.

### Configure Auth0

1. In **Applications → Applications**, create a **Single Page Application** for Shopline. Add `https://shopline-bice.vercel.app` and `http://localhost:5173` to Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins.
2. In **Applications → APIs**, create an API with identifier `https://shopline-api`. Use this same identifier for the audience environment variables below.
3. Create a separate **Machine to Machine** application for the server-side preference adapter. Authorize it for the **Auth0 Management API** with `read:users` and `update:users`. Its client secret is only for the Vercel server function; never put it in a `VITE_` variable or frontend code.
4. In Vercel → **Project Settings → Environment Variables**, set the following values for the environments you deploy:

| Variable | Value |
| --- | --- |
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain, such as `your-tenant.us.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | Client ID of the Shopline Single Page Application |
| `VITE_AUTH0_AUDIENCE` | `https://shopline-api` |
| `AUTH0_DOMAIN` | Same tenant domain, without `https://` |
| `AUTH0_AUDIENCE` | `https://shopline-api` |
| `AUTH0_MANAGEMENT_CLIENT_ID` | Client ID of the Management API Machine to Machine application |
| `AUTH0_MANAGEMENT_CLIENT_SECRET` | Secret of that Machine to Machine application |

5. Redeploy Shopline after adding the Vercel variables. For local development, put the values in your own untracked `.env.local` file based on `.env.example`; do not commit real credentials.

The `/api/preferences` route verifies each Auth0 access token against the tenant's JWKS and expected API audience before reading or updating only the signed-in user's metadata. Auth0 Management API credentials stay server-side. When settings are available, **Quick list · use current settings** waits for them to load, then builds the plan from those preferences. New accounts get a first-use preference record from their current settings.

## Price transparency

The included sample catalog contains **indicative planning estimates**, not live quotes. Retail prices, package size, promotions, delivery fees, taxes and stock vary by retailer and store. The app does not label the fallback catalog as live or guaranteed.

For live Kroger product lookups, configure CLIENT_ID and CLIENT_SECRET as server-side environment variables in your Vercel project (these are already present in the current Vercel configuration). The server adapter also accepts KROGER_CLIENT_ID and KROGER_CLIENT_SECRET as aliases. Do not put these secrets in browser-side VITE_ variables. The API route searches the nearest returned Kroger location and reads the current prices supplied by Kroger at request time. Availability depends on API account access, store coverage and provider limits.

Official references:
- Kroger Public APIs: https://www.postman.com/kroger/the-kroger-co-s-public-workspace/overview
- Kroger product and store-specific pricing overview: https://www.postman.com/kroger/the-kroger-co-s-public-workspace/documentation/ki6utqb/kroger-public-apis
- Instacart Developer Platform (a possible future recipe / retailer / marketplace integration; API key access is required): https://docs.instacart.com/developer_platform_api

This beta does **not** place orders or guarantee checkout prices. A store name and current price appear only when Kroger returns a product match; unmatched items stay in the basket with an explicit indicative estimate. Pickup and delivery are planning modes only, not retailer checkout integrations. Road directions use a public OSRM routing service and OpenStreetMap map data; these public services have no Shopline SLA.

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

- Beta preferences, basket data and an optional remembered household profile stay in this browser's local storage. No account sync is enabled. Clear browser storage to remove the locally saved data.
- Precise coordinates are requested only after the user presses the location button; coordinates are kept in memory for that session and are not added to the saved household profile.
- No identity, payment or order data is collected.
- Account types are a future extension seam only; account creation is intentionally not enabled.
- Live offer comparison across multiple retailers, inventory guarantees, loyalty pricing, and retailer checkout integrations need further provider approvals and integrations. The current live search is limited to participating Kroger locations in range, and unmatched products remain estimates.

## Stack

React · TypeScript · Vite · Lucide · Vercel Functions · Vitest