# MansaOferta

Marketplace **SaaS multi-tenant** para pymes: cada pyme (tenant) tiene su propio dashboard donde publica **productos y servicios**, gestiona pedidos y ve analíticas, bajo un plan de suscripción. Los consumidores exploran ofertas de todas las pymes, arman un carrito y compran.

## Stack

- **Next.js 16** (App Router, Server Actions) + **React 19** + **Tailwind v4**
- **PostgreSQL + Prisma** — base de datos y migraciones tipadas
- **Auth.js v5** — login con email/contraseña (argon2) + Google OAuth opcional
- **SSE** — notificaciones de pedidos en tiempo real, sin infraestructura extra
- **Storage** pluggable — driver `local` (dev) o `s3` (S3 / Cloudflare R2 / MinIO)
- **Zod** — validación de todas las entradas
- Autorización server-side en una capa de acceso a datos (`lib/dal.ts`), sin RLS

## Arquitectura

| Capa | Ubicación |
|------|-----------|
| Modelo de datos | `prisma/schema.prisma` (User, Tenant, Membership, Subscription, Product, Order, OrderItem) |
| Auth + sesión | `auth.ts`, `auth.config.ts`, `middleware.ts` |
| Autorización (reemplaza RLS) | `lib/dal.ts` (`requireUser`, `requireTenantMember`, `requireSuperadmin`) |
| Checkout transaccional | `lib/checkout.ts` (una order por tenant, stock atómico) |
| Realtime | `lib/events.ts` + `app/api/realtime/route.ts` (SSE) |
| Storage | `lib/storage.ts` (`local` / `s3`) |
| Planes SaaS | `lib/plans.ts` (límites por plan) + modelo `Subscription` (hook de billing) |
| Cifrado de secretos | `lib/crypto.ts` (AES-256-GCM para el token de MercadoPago) |

### Rutas principales

- Público: `/`, `/browse`, `/p/[slug]` (detalle), `/s/[slug]` (vidriera de una pyme), `/cart`
- Cuenta: `/login`, `/register`, `/orders` (mis compras)
- Dashboard pyme: `/dashboard/products`, `/dashboard/orders`, `/dashboard/analytics`, `/dashboard/settings`
- Operador SaaS: `/admin`

## Puesta en marcha (local)

Requisitos: Node 24+, PostgreSQL.

```bash
cp .env.example .env      # completá DATABASE_URL, AUTH_SECRET, ENCRYPTION_KEY
npm install
npm run db:migrate        # crea el esquema
npm run db:seed           # datos demo (opcional)
npm run dev
```

Generá los secretos:

```bash
openssl rand -base64 33   # AUTH_SECRET
openssl rand -hex 32      # ENCRYPTION_KEY
```

### Usuarios demo (tras `db:seed`)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `pyme@demo.com` | `password123` | dueño de pyme |
| `cliente@demo.com` | `password123` | consumidor |
| `admin@demo.com` | `password123` | superadmin |

## Docker

```bash
docker compose up --build
```

Levanta Postgres + la app; las migraciones se aplican al arrancar (`prisma migrate deploy`). Configurá las variables en `.env` (o secrets del compose).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `prisma generate` + build de producción |
| `npm run lint` / `npm run typecheck` | Lint / chequeo de tipos |
| `npm test` | Tests (Vitest) — requiere `DATABASE_URL` |
| `npm run db:migrate` / `db:seed` / `db:studio` | Utilidades de Prisma |

## Tests

`tests/checkout.test.ts` cubre el checkout transaccional (descuento de stock atómico, rollback ante stock insuficiente, servicios ilimitados, split multi-tenant y validación de cantidades). Corren contra el Postgres de `DATABASE_URL`.

## Notas

- El token de MercadoPago se guarda **cifrado** y nunca se expone al cliente.
- El realtime por SSE usa un event bus en proceso; para escalar horizontalmente, cambiar `lib/events.ts` a Redis pub/sub o `LISTEN/NOTIFY`.
- El billing real (Stripe / MercadoPago Suscripciones) está pendiente: el modelo `Subscription` y `lib/plans.ts` son el enganche.
