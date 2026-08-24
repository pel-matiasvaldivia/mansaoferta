# Real-time Notifications Troubleshooting Guide

## Issue
Notifications don't appear automatically when orders are placed - page refresh is required.

## Root Cause
Supabase Realtime is not enabled for the `orders` table in your database.

## Solution: Enable Realtime in Supabase

### Step 1: Enable Realtime for Orders Table
1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Find the `orders` table in the list
4. Click the toggle to **enable** replication for `orders`
5. Click **Save**

### Step 2: Verify Realtime is Working

#### Test as Pyme (Seller):
1. Open your dashboard in one browser window
2. Open an incognito/private window
3. In the incognito window, login as a consumer
4. Add a combo to cart and checkout
5. **Expected**: Your Pyme dashboard should show a toast notification immediately
6. **Expected**: The order should appear in "Pedidos Recibidos" without refresh

#### Test as Consumer:
1. Login as consumer
2. Place an order
3. In another window, login as the Pyme who owns that combo
4. Update the order status (e.g., "En preparación")
5. **Expected**: Consumer should see a toast notification immediately

### Step 3: Check Browser Console
If notifications still don't work:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors related to:
   - Supabase connection
   - WebSocket errors
   - Realtime subscription errors

### Step 4: Verify Environment Variables
Ensure your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## How It Works

### For Pyme Users:
- Listens to **INSERT** events on `orders` table
- Checks if the order's combo belongs to the Pyme
- Shows toast: "¡Nuevo pedido para [Combo Name]!"
- Automatically refreshes the dashboard

### For Consumers:
- Listens to **UPDATE** events on `orders` table
- Filters by `consumer_id`
- Shows toast when order status changes
- Automatically refreshes the dashboard

## Implementation Details

**Component**: `RealtimeListener.tsx`
- Located in `/components`
- Already included in root layout
- Uses Supabase Realtime Postgres Changes
- Uses `sonner` for toast notifications

**Files Involved**:
- `components/RealtimeListener.tsx` (client component)
- `components/RealtimeInitializer.tsx` (server component)
- `app/layout.tsx` (includes RealtimeInitializer)

## Common Issues

### Issue: "No notifications at all"
**Solution**: Enable Realtime replication for `orders` table (Step 1 above)

### Issue: "Notifications work sometimes"
**Solution**: Check if you have multiple tabs open - Supabase limits concurrent connections

### Issue: "Console shows WebSocket errors"
**Solution**: Verify your Supabase project is not paused and your API keys are correct

## Alternative: Manual Refresh
If Realtime can't be enabled, you can add a manual refresh button or auto-refresh timer:

```tsx
// Add to dashboard
useEffect(() => {
  const interval = setInterval(() => {
    router.refresh()
  }, 30000) // Refresh every 30 seconds
  
  return () => clearInterval(interval)
}, [])
```

But **Realtime is the recommended solution** for instant notifications!
