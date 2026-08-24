# Google OAuth Setup

Google sign-in is optional — email/password login works without it. To enable it:

## 1. Create OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**.
2. **Create Credentials → OAuth client ID → Web application**.
3. Add an **Authorized redirect URI**:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://TU_DOMINIO/api/auth/callback/google`
4. Copy the **Client ID** and **Client secret**.

## 2. Configure the app

Set these in your `.env`:

```env
AUTH_GOOGLE_ID="your-client-id"
AUTH_GOOGLE_SECRET="your-client-secret"
```

Auth.js registers the Google provider automatically when both variables are present (see `auth.ts`). Restart the app to pick up the change.
