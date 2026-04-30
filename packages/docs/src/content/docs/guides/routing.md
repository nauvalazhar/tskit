---
title: Routing & Data Fetching
description: How routing, layouts, and data fetching work in TSKit.
sidebar:
  order: 0
---

TSKit uses [TanStack Start](https://tanstack.com/start) for file-based routing. Routes are thin shells that guard access, load data, and render components. This guide covers how the route tree is structured, how data flows from database to component, and how to add new routes.

## File naming conventions

Route files live in `src/routes/`. The file name determines the URL path, with a few special conventions:

| Pattern | What it does | Example |
|---------|-------------|---------|
| `__root.tsx` | Root layout, wraps everything | Always runs first |
| `_prefix/` | Layout group (prefix not in URL) | `_app/dashboard.tsx` renders at `/dashboard` |
| `name.tsx` | Page or layout | `_app/billing.tsx` is the billing layout |
| `name.index.tsx` | Index page inside a layout | `_app/billing.index.tsx` renders at `/billing` |
| `name.child.tsx` | Nested route | `_app/settings.security.tsx` renders at `/settings/security` |
| `$param.tsx` | Dynamic segment | `invite.$invitationId.tsx` renders at `/invite/:invitationId` |

Dot notation creates nesting without extra directories. `settings.team.members.tsx` renders at `/settings/team/members` and nests inside the `settings.team.tsx` layout, which nests inside `settings.tsx`.

## Route tree

TSKit's routes are organized into layout groups. Each group shares a layout and access rules:

```
routes/
├── __root.tsx              # Root layout (session, settings, org context)
├── _auth/                  # Guest-only (redirects to /dashboard if logged in)
│   ├── route.tsx           # Layout + guard
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   └── verify-2fa.tsx
├── _app/                   # Authenticated (redirects to /login if not logged in)
│   ├── route.tsx           # Layout (sidebar, banner) + guard
│   ├── dashboard.tsx
│   ├── billing.tsx         # Billing layout
│   ├── billing.index.tsx   # Billing index page
│   ├── billing.success.tsx
│   ├── settings.tsx        # Settings layout (tabs)
│   ├── settings.index.tsx  # Profile tab
│   ├── settings.security.tsx
│   └── ...
├── _marketing/             # Public (no guard)
│   ├── route.tsx           # Marketing layout
│   ├── index.tsx           # Landing page
│   └── pricing.tsx
├── admin/                  # Admin (requires admin role)
└── api/                    # Server-only API handlers
```

## Route guards

Guards run in `beforeLoad` before the page renders. They check route context (provided by the root layout) and redirect if the condition isn't met.

The root layout (`__root.tsx`) fetches the session, active organization, and user settings in its `beforeLoad` hook. Every child route can access this data through context.

**Guest-only guard** (`_auth/route.tsx`) - redirects logged-in users to the dashboard:

```ts
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    if (context.session?.user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})
```

**Authenticated guard** (`_app/route.tsx`) - redirects guests to login:

```ts
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    if (!context.session?.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: RouteComponent,
})
```

Since `_app/route.tsx` guards all routes under `_app/`, individual pages don't need to check authentication themselves.

## Layouts

A layout route renders shared UI (sidebar, tabs, headers) and an `<Outlet />` where child routes appear.

The `_app/route.tsx` layout wraps all authenticated pages with the sidebar and email verification banner:

```tsx
function RouteComponent() {
  return (
    <SidebarLayout sidebar={<AppSidebar />} banner={<EmailVerificationBanner />}>
      <Outlet />
    </SidebarLayout>
  )
}
```

The settings page uses a layout with tabs. Each tab is a separate child route:

```tsx
// _app/settings.tsx - layout with tabs
function RouteComponent() {
  const { pathname } = useLocation()

  return (
    <>
      <PageHeader>
        <Heading>Settings</Heading>
        <Tabline value={pathname}>
          <TablineItem value="/settings" render={<Link to="/settings" />}>
            Profile
          </TablineItem>
          <TablineItem value="/settings/security" render={<Link to="/settings/security" />}>
            Security
          </TablineItem>
        </Tabline>
      </PageHeader>
      <Outlet />
    </>
  )
}
```

Then `settings.index.tsx` renders the profile form, `settings.security.tsx` renders the security form, and so on. They all appear inside the settings layout.

## Data fetching

The default pattern is **the loader awaits a server function and returns the data; components read it via `Route.useLoaderData()`**. React Query is reserved for a few specific escape hatches.

### Loader with context

For simple data that's already in route context (like the current user), read it directly in the loader:

```ts
export const Route = createFileRoute('/_app/dashboard')({
  loader: async ({ context }) => {
    return { user: context.session?.user || null }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useLoaderData()
  return <Heading>Welcome back, {user?.name}!</Heading>
}
```

### Loader with server functions

For data fetched from the database, call a server function in the loader and return the result:

```ts
export const Route = createFileRoute('/_app/billing/')({
  loader: async () => {
    const subscription = await getSubscription()
    const role = await getActiveMemberRole()
    return { subscription, canManage: role === 'owner' || role === 'admin' }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { subscription, canManage } = Route.useLoaderData()
  return <SubscriptionStatus subscription={subscription} canManage={canManage} />
}
```

### Detail routes with `notFound()`

For routes scoped to a single entity, narrow at the loader. The non-null shape flows through to `useLoaderData`:

```ts
export const Route = createFileRoute('/admin/teams/$teamId')({
  loader: async ({ params }) => {
    const team = await getTeam({ data: { teamId: params.teamId } })
    if (!team) throw notFound()
    return { team }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { team } = Route.useLoaderData()
  return <h1>{team.name}</h1>
}
```

### Reading loader data from a non-route file

When a child component (e.g. a table inside the route's tree) needs the loader data, use `getRouteApi`:

```ts
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/admin/teams/')

export function TeamsTable() {
  const { teams, totalPages } = routeApi.useLoaderData()
  // ...
}
```

### Mutations

After a mutation, call `await router.invalidate()` to re-run all active loaders:

```ts
async function handleDelete() {
  await deleteTeam({ data: { teamId } })
  await router.invalidate()
}
```

This is the single invalidation path. Don't reach for `queryClient.invalidateQueries` for route data. It would be a parallel cache that has to be kept in sync.

### React Query usage

The kit ships with TanStack Query installed. By default it's only used where route loaders aren't a good fit:

- **Polling**: `billing.success.tsx` waits for a webhook to update the subscription, polling with `refetchInterval` until the status flips or a timeout expires.
- **Conditional fetches**: `change-plan-dialog.tsx` fetches the plan list only when the dialog opens (`enabled: open`).
- **Cross-component shared state**: `hooks/use-subscription.ts` exposes the current subscription and entitlement helpers to any component.

In these cases the `queryOptions` factory lives next to the consumer file:

```ts
// inside billing.success.tsx
const pollingQuery = (enabled: boolean) =>
  queryOptions({
    queryKey: ['billing', 'subscription', 'polling'],
    queryFn: () => getSubscription(),
    refetchInterval: enabled ? 2000 : false,
  })

function RouteComponent() {
  const { data } = useQuery(pollingQuery(!timedOut))
  // ...
}
```

So there's no `queries/` directory by default. You only see `queryOptions` where they're actually consumed.

#### Adopting React Query more broadly

If your feature genuinely benefits from React Query (background refetch on focus, optimistic updates, infinite queries, mutation primitives with `isPending`/error state, or just a familiar mental model), you're welcome to use it. The conventional setup is:

1. Add `src/queries/<domain>.queries.ts` with `queryOptions` factories
2. Call `context.queryClient.ensureQueryData(...)` in route loaders to prime the cache
3. Read with `useSuspenseQuery(...)` in components (stays subscribed to the cache, so mutations that call `queryClient.invalidateQueries(...)` re-render automatically)

The loader-returns-data pattern is just the kit's default for new pages, not a hard rule.

## Reading data in components

| Method | When to use |
|--------|------------|
| `Route.useRouteContext()` | Session, settings, active org, teams (from root layout) |
| `Route.useLoaderData()` | Loader return value (the default) |
| `getRouteApi('/path').useLoaderData()` | Same, from a non-route file (e.g. table component) |
| `Route.useParams()` | URL parameters like `$teamId` |
| `useSuspenseQuery(options)` | Cross-component shared state (e.g. `useSubscription`) with co-located `queryOptions` |
| `useQuery(options)` | Polling or conditional fetches with co-located `queryOptions` |

## Adding a new route

To add a new page at `/reports`:

1. Create the route file at `src/routes/_app/reports.tsx`.
2. If it needs data, create a server function in `functions/` and call it from the route's `loader`. Return the data.
3. Create the component in `components/reports/` and read the data via `Route.useLoaderData()`.

The route picks up authentication automatically from the `_app` layout guard. See the [Adding a Page](/reference/adding-a-page/) reference for a full example.
