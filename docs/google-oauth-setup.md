# Google OAuth Setup Guide

To enable "Sign in with Google", you need to configure both **Google Cloud Console** and **Supabase**.

## Step 1: Get Supabase Callback URL
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** (sidebar) → **Providers**.
3. Select **Google**.
4. Copy the **Callback URL (for OAuth)**.
   * Format: `https://<your-project-ref>.supabase.co/auth/v1/callback`

## Step 2: Configure Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a **New Project** (e.g., "MansaOferta").
3. **OAuth Consent Screen**:
   - Go to **APIs & Services** → **OAuth consent screen**.
   - Select **External** and click **Create**.
   - Fill in:
     - **App Name**: MansaOferta
     - **User Support Email**: Your email
     - **Developer Contact Email**: Your email
   - Click **Save and Continue** (skip Scopes/Test Users for now if testing, or add yourself as a test user).
4. **Create Credentials**:
   - Go to **Credentials** (sidebar).
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**.
   - **Application Type**: Web application.
   - **Name**: "Supabase Auth".
   - **Authorized JavaScript origins**:
     - Add: `http://localhost:3000` (for local dev)
     - Add: `https://<your-project-ref>.supabase.co` (optional but good practice)
   - **Authorized redirect URIs**:
     - **Paste the Supabase Callback URL** from Step 1.
   - Click **Create**.
5. **Copy Keys**:
   - Copy the **Client ID**.
   - Copy the **Client Secret**.

## Step 3: Configure Supabase
1. Go back to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**.
2. Paste the **Client ID**.
3. Paste the **Client Secret**.
4. Enable **"Enable Sign in with Google"**.
5. Click **Save**.

## Step 4: URL Configuration
1. In Supabase, go to **Authentication** → **URL Configuration**.
2. **Site URL**: Set to `http://localhost:3000` (for local dev).
3. **Redirect URLs**:
   - Add `http://localhost:3000/auth/callback`
   - Add `https://<your-vercel-url>.vercel.app/auth/callback` (when you deploy later).
4. Click **Save**.

## Step 5: Test
1. Restart your local server: `npm run dev`.
2. Go to `http://localhost:3000/login`.
3. Click "Sign in with Google".
