# TechZone Web

Customer-facing storefront for the E-Commerce platform. It is a Next.js App
Router application that talks to the Express API in [`../api`](../api) and uses
Stripe for checkout.

## Recent Updates

**Updated: 2026-11-21**

- Checkout now uses the server-created Stripe PaymentIntent and client secret
  returned by the order API.
- Authentication uses HTTP-only cookies and refreshes failed requests with a
  shared single-flight interceptor.
- Address and order history flows are available for the authenticated
  storefront.
- Docker Compose publishes the web container on host port `3090`; local
  `npm run dev` remains on port `3000`.

## Technology Stack

- Next.js 16 (App Router, React Compiler enabled)
- React 19 + TypeScript (strict)
- Tailwind CSS v4
- Redux Toolkit for shared client state (categories, cart items)
- Jotai for transient UI state (toasts)
- SWR + axios for data fetching and caching
- Joi for form validation
- Stripe.js / `@stripe/react-stripe-js` for payments
- GSAP for hero animations, `lucide-react` for icons
- Radix UI (`react-slot`), `class-variance-authority`, `tailwind-merge`, `clsx` for the UI layer

## Requirements

- Node.js 20+
- A running instance of the [API](../api) (defaults to `http://localhost:8090`)
- PostgreSQL, Redis and RabbitMQ are only needed by the API, not by the web app

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env` in the project root (see [Environment Variables](#environment-variables)):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8090
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the API. The client appends `/api` to it. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key. Safe to expose; the secret key lives only in `api/.env`. |

Both variables are prefixed with `NEXT_PUBLIC_` and are therefore embedded in
the browser bundle — never put secrets here.

## Project Structure

```text
web/
├── public/                     # Static assets (logos, hero images)
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── layout.tsx          # Root layout (providers, header/footer, toasts)
│   │   ├── providers.tsx       # Redux provider wrapper
│   │   ├── page.tsx            # Home page
│   │   ├── shop/               # Product catalogue
│   │   ├── products/[id]/      # Product details
│   │   ├── cart/               # Cart
│   │   ├── checkout/           # Checkout flow + success page
│   │   ├── auth/               # Login, register, verify-email
│   │   ├── verify-email/       # Email verification landing route
│   │   └── account/orders/     # Order history
│   ├── features/               # Feature-scoped UI, hooks and schemas
│   │   ├── auth/ cart/ checkout/ home/ orders/ products/ shop/
│   ├── shared/
│   │   ├── components/         # Layout, product, toast and custom UI components
│   │   ├── hooks/              # Reusable SWR hooks (products, toast)
│   │   ├── services/           # API service functions (auth, products, cart, ...)
│   │   ├── lib/
│   │   │   ├── axios.ts        # Axios instance + refresh interceptor
│   │   │   ├── api/            # endpoints.ts (route map) and mappers.ts
│   │   │   ├── errors/         # ApiError + handleApiError
│   │   │   └── stripe.ts       # Stripe.js loader
│   │   ├── atoms/toast/        # Jotai toast atoms and actions
│   │   ├── types/api.ts        # Backend wire/domain types
│   │   └── ui/                 # Primitive UI (button, input)
│   ├── store/                  # Redux store, provider and slices
│   ├── hooks/                  # App-level hooks (useAuth)
│   └── conf/config.store.ts    # Store branding, hero slides, nav links
├── next.config.ts              # Remote image hosts, React Compiler
└── package.json
```

## Routes

| Route | Description | Auth |
| --- | --- | --- |
| `/` | Home: hero, categories, featured products | Public |
| `/shop` | Product catalogue with filters, sorting and pagination | Public |
| `/products/[id]` | Product details, variant (SKU) selector, add to cart | Public |
| `/cart` | Cart contents and summary | Public (cart is user-scoped) |
| `/checkout` | Shipping → review → Stripe payment | Required |
| `/checkout/success` | Post-payment confirmation | Required |
| `/auth/login` | Login form | Public |
| `/auth/register` | Registration form | Public |
| `/auth/verify-email` | "Check your inbox" pending state | Public |
| `/verify-email` | Consumes the emailed verification token | Public |
| `/account/orders` | Authenticated order history | Required |

## Architecture

### API layer

- [`src/shared/lib/api/endpoints.ts`](./src/shared/lib/api/endpoints.ts) is the
  single source of truth for every backend route. Add new backend endpoints here
  instead of hardcoding paths in feature code.
- [`src/shared/lib/axios.ts`](./src/shared/lib/axios.ts) exposes a shared axios
  instance with `baseURL = ${NEXT_PUBLIC_API_URL}/api` and `withCredentials: true`.
- [`src/shared/services/`](./src/shared/services) holds one module per backend
  resource (`auth`, `products`, `categories`, `cart`, `addresses`, `orders`).
  Services call the axios instance, unwrap the `{ data }` envelope and pass the
  payload through `mappers.ts` to convert raw string numerics into domain types.
- [`src/shared/lib/api/mappers.ts`](./src/shared/lib/api/mappers.ts) normalises
  PostgreSQL `DECIMAL` values (returned as strings) into numbers.

### Authentication

Authentication relies entirely on HTTP-only `accessToken` / `refreshToken`
cookies set by the backend; no token is ever read or stored in JavaScript.
When any request returns `401`, the axios interceptor performs a single-flight
`GET /auth/refresh` (concurrent 401s share one refresh call) and retries the
original request once. Auth routes are excluded from this retry cycle.

Because the backend exposes no `/auth/me` endpoint,
[`useAuth`](./src/hooks/useAuth.ts) probes the session by calling
`GET /auth/refresh` through SWR and derives `isAuthenticated` from the result.

### Data fetching and state

- **SWR** caches server data per resource (e.g. `products/with-skus`,
  `addresses`) with `revalidateOnFocus` disabled.
- **Redux Toolkit** ([`src/store`](./src/store)) owns shared client state: the
  shop categories slice and the cart items slice (with async `fetchCartItems`).
- **Jotai** ([`src/shared/atoms/toast`](./src/shared/atoms/toast)) drives the
  toast notifications rendered by `ToastContainer` in the root layout.

### Payments

Checkout is a three-step flow (shipping → review → payment). Creating the order
(`POST /orders`) also creates the Stripe PaymentIntent server-side and returns
its `client_secret`; the web app then confirms the card payment with Stripe.js
and redirects to `/checkout/success`. The stored `client_secret` is reused on
back-and-forth navigation to avoid creating duplicate orders.

## Adding a New API Endpoint

1. Add the route to `API_ENDPOINTS` in `src/shared/lib/api/endpoints.ts`.
2. Add a service function in the matching `src/shared/services/*.service.ts`
   file (unwrap `{ data }`, run the payload through the appropriate mapper).
3. Consume it from a feature component or an SWR hook in
   `src/shared/hooks` / `src/features/*/hooks`.
4. If the API returns new shapes, extend `src/shared/types/api.ts` with both the
   `Raw*` wire type and the normalised domain type, and add a mapper.

## Notes

- `next.config.ts` allow-lists remote image hosts (Cloudflare R2 and
  Cloudinary). Add new hosts there before using `next/image` with them.
- The storefront branding (name, hero slides, nav links, categories) is
  configured in [`src/conf/config.store.ts`](./src/conf/config.store.ts).
