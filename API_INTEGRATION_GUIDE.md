# API Integration Guide - Tarek Helal Frontend

## 1) Quick Production Readiness Check

The project is **partially ready** for production/API integration.

What is already in place:
- A centralized API layer exists in `src/lib/api.ts`.
- The API base URL already comes from `NEXT_PUBLIC_API_URL`.
- Client state for cart and logged-in user is already isolated in persistent browser storage helpers.
- Type definitions for products, categories, orders, users, reviews, bundles, payments, and variants already exist in `src/types`.

What still needs backend wiring before a full production launch:
- The storefront still renders catalog data from `src/data/salondata.ts` in some routes.
- The product details page still uses local mock products instead of fetching a product by ID.
- The admin page still passes empty arrays into the dashboard.
- `AdminDashboard` still reads users from `localStorage` instead of a backend source.

Bottom line: the app is structurally close, but it is **not fully production-connected yet** until the catalog, product details, admin dashboard, and order flow are switched to live APIs.

---

## 2) One-Change Setup for Backend Linking

Put the backend URL here:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

If your backend already exposes routes without the `/api` prefix, use the exact base path you want the frontend to hit.

All API calls in `src/lib/api.ts` are built from that one base URL.

---

## 3) Backend Endpoints Required

The frontend already expects the following endpoints. These are the contracts to request from the backend team.

### 3.1 Authentication

#### `POST /auth/login`
Used by `loginUser()`.

Request body:

```json
{
  "phone": "01023456789",
  "password": "secret123"
}
```

Expected response:

```json
{
  "token": "jwt-token-or-access-token",
  "user": {
    "id": "uuid",
    "first_name": "Ahmed",
    "last_name": "Ali",
    "phone": "01023456789",
    "role": "Customer",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z",
    "deleted_at": null
  }
}
```

#### `POST /auth/register`
Used by `registerUser()`.

Request body:

```json
{
  "first_name": "Ahmed",
  "last_name": "Ali",
  "phone": "01023456789",
  "password": "secret123",
  "role": "Customer"
}
```

Expected response:

```json
{
  "token": "jwt-token-or-access-token",
  "user": {
    "id": "uuid",
    "first_name": "Ahmed",
    "last_name": "Ali",
    "phone": "01023456789",
    "role": "Customer"
  }
}
```

#### Recommended next auth endpoints
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

These are not required by the current frontend code, but they are recommended for a production auth flow.

---

### 3.2 Catalog

#### `GET /products`
Used by `fetchProducts()`.

Expected response: array of products.

Each product should include at least:

```json
{
  "id": "uuid",
  "category_id": "uuid",
  "name": "Salon Chair",
  "description": "...",
  "price": 12500,
  "image": "https://...",
  "category": "uuid-or-name",
  "images": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "media_url": "https://...",
      "is_primary": true,
      "sort_order": 1
    }
  ],
  "variants": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "price": 12500
    }
  ]
}
```

Important mapping rules:
- `mapDjangoProduct()` uses `images[0]` or the image marked `is_primary`.
- If `variants[0].price` exists, it wins over a flat `price` field.
- If the backend returns `media_url`, that can be used as the fallback image.

#### `GET /products/{id}`
Not currently called by the frontend, but strongly recommended for the product detail page migration.

#### `POST /products`
Used by `createProduct()`.

#### `PUT /products/{id}`
Used by `updateProduct()`.

#### `DELETE /products/{id}`
Used by `deleteProduct()`.

---

### 3.3 Categories

#### `GET /categories`
Used by `fetchCategories()`.

Expected response: array of categories.

Each category should include:

```json
{
  "id": "uuid",
  "name": "Hair Chairs",
  "media_url": "https://...",
  "description": "..."
}
```

The frontend fallback logic also accepts `image` if `media_url` is missing.

---

### 3.4 Bundles and Reviews

#### `GET /bundles`
Used by `fetchBundles()`.

Expected response: array of salon bundles.

Suggested payload:

```json
{
  "id": "uuid",
  "name": "Starter Salon Bundle",
  "description": "...",
  "image": "https://...",
  "price": 42000,
  "originalPrice": 50000,
  "badge": "Best Value",
  "itemsList": ["Chair", "Mirror", "Wash Unit"]
}
```

#### `GET /reviews`
Used by `fetchReviews()`.

Expected response: array of reviews.

Suggested payload:

```json
{
  "id": "uuid",
  "name": "Customer Name",
  "city": "Cairo",
  "text": "Great service",
  "rating": 5,
  "image": "https://..."
}
```

---

### 3.5 Orders

#### `GET /orders`
Used by `fetchOrders()`.

This is the admin list endpoint.

#### `POST /orders`
Used by `createOrder()`.

Request body shape expected by the frontend:

```json
{
  "user_id": "uuid-or-null",
  "address_id": "uuid-or-null",
  "status": "Pending",
  "subtotal": 12500,
  "discount": 0,
  "total": 12500,
  "items": [
    {
      "product_variant_id": "uuid",
      "product_name": "Salon Chair",
      "variant_description": "Default",
      "price": 12500,
      "quantity": 1,
      "subtotal": 12500
    }
  ]
}
```

Expected response: the created order in the same shape used by `mapDjangoOrder()`.

#### `PATCH /orders/{id}`
Used by `updateOrderStatus()`.

Expected body:

```json
{
  "status": "Processing"
}
```

#### Recommended next order endpoints
- `GET /orders/{id}`
- `PATCH /orders/{id}/payment`
- `GET /orders/{id}/items`

---

### 3.6 Users and Addresses

The current UI still reads users from browser storage in some places, but for production the backend should ideally provide:

- `GET /users`
- `GET /users/{id}`
- `GET /addresses`
- `POST /addresses`
- `PUT /addresses/{id}`
- `DELETE /addresses/{id}`

These are not all called today, but they are the next obvious backend contracts for a real account and checkout flow.

---

## 4) What To Change In Each File

This is the copy-paste map for the frontend team.

### `src/lib/api.ts`

Keep this file as the single integration point.

Current key line:

```ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
```

What to change:
- Only update `NEXT_PUBLIC_API_URL` in `.env.local` when the backend URL changes.
- If the backend uses different route names, adjust them once here, not in components.

Do not duplicate fetch calls elsewhere.

---

### `src/app/page.tsx`

Current imports:

```ts
import { products, categories } from "../data/salondata";
import { fetchProducts, fetchCategories, fetchBundles, fetchReviews, fetchOrders } from "../lib/api";
```

What to change:
- Replace local catalog filtering with state loaded from `fetchProducts()` and `fetchCategories()`.
- Keep `usePersistentLocalState` for cart and user only.
- Add loading and error UI for API failures.

Suggested final shape:
- `products` state from API.
- `categories` state from API.
- `filteredProducts` computed from that state.

---

### `src/app/product/[id]/page.tsx`

Current imports:

```ts
import { products, categories } from "../../../data/salondata";
```

What to change:
- Fetch a single product by route `id` from the API.
- Fetch related products from the same category.
- Derive the category label from API categories, not static data.

Recommended flow:
- `GET /products/{id}` for the current product.
- `GET /products?category_id=...` or client-side filter from `GET /products` for related items.

---

### `src/app/admin/page.tsx`

Current behavior:

```ts
<AdminDashboard 
  products={[]}
  categories={[]}
  orders={[]}
  onUpdateProducts={() => {}}
  onUpdateOrders={() => {}}
/>
```

What to change:
- Fetch `products`, `categories`, and `orders` before rendering the dashboard.
- Pass real data to `AdminDashboard`.
- Replace the empty callback stubs with API-backed update handlers.

---

### `components/ProductCard.tsx`

Current import:

```ts
import { categories } from "../src/data/salondata";
```

What to change:
- Remove the static category import.
- Pass `categoryName` from the parent page, or keep a category lookup map in state.

This keeps the component reusable once the catalog becomes API-driven.

---

### `components/AdminDashboard.tsx`

Current local-storage dependency:

```ts
const savedUsersStr = localStorage.getItem("th_users");
```

What to change:
- Replace localStorage user lookup with backend users when the endpoint is available.
- Keep localStorage only as a temporary fallback, not the main source of truth.

Also update CRUD handlers to call API functions instead of mutating arrays only in memory.

---

### `src/data/salondata.ts`

This file is currently acting as a mock catalog.

What to change:
- Keep it only as a fallback seed during migration.
- Do not use it as the live source after API wiring is complete.

Suggested migration path:
1. Load from API first.
2. Fall back to `salondata` only if the request fails.
3. Remove the fallback after backend stability is confirmed.

---

## 5) Integration Order

Use this order to wire the project with the least friction:

1. Set `NEXT_PUBLIC_API_URL`.
2. Connect `GET /products` and `GET /categories` in `src/app/page.tsx`.
3. Connect `GET /products/{id}` in `src/app/product/[id]/page.tsx`.
4. Connect `GET /orders` and admin CRUD in `src/app/admin/page.tsx`.
5. Replace the remaining localStorage-backed admin user lookup.
6. Add loading and error states everywhere the network can fail.

---

## 6) Notes For The Backend Team

Please keep these response rules stable:

- Use `id` as a string UUID everywhere.
- Return `images` and `variants` on products.
- Return `media_url` on categories.
- Return `items` on orders.
- Keep `status` values aligned with the frontend enum values.
- Keep login/register response shapes consistent with `token` and `user`.

If the backend team can keep those field names stable, the frontend will need minimal changes.
