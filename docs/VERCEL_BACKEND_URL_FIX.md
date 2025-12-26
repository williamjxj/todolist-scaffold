# Fixing Backend URL Configuration in Vercel

If your frontend shows "Cannot connect to backend server" errors, you need to configure the correct backend URL in Vercel.

## Quick Fix

**Set the `VITE_API_URL` environment variable in Vercel:**

1. Go to your Vercel dashboard
2. Select your project (`todolist-scaffold`)
3. Go to **Settings** → **Environment Variables**
4. Add or update the `VITE_API_URL` variable:
   ```
   VITE_API_URL=https://react-fastapi-health-app.onrender.com/api
   ```
5. **Important**: Make sure to select the correct **Environment** (Production, Preview, Development)
6. **Save** the environment variable
7. **Redeploy** your Vercel application (or wait for next deployment)

## Verify Backend is Working

Before configuring Vercel, verify your backend is accessible:

```bash
# Check backend health
curl https://react-fastapi-health-app.onrender.com/health

# Check if todos endpoint exists
curl https://react-fastapi-health-app.onrender.com/api/todos
```

If `/api/todos` returns `{"detail":"Not Found"}`, your backend might not have the todos routes configured. Check:
- Backend routes are mounted at `/api/todos` prefix
- Backend is deployed and running
- Database is connected

## After Updating VITE_API_URL

1. **Redeploy** your Vercel application (Settings → Deployments → Redeploy)
2. Wait for deployment to complete (usually 1-2 minutes)
3. Refresh your frontend
4. The connection error should be resolved

## Also Configure CORS on Backend

Don't forget to configure CORS on your Render backend:

1. Go to Render.com dashboard
2. Select your backend service (`react-fastapi-health-app`)
3. Go to **Environment** tab
4. Add or update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://todolist-scaffold.vercel.app,http://localhost:5173
   ```
5. Restart the Render service

## Troubleshooting

### Issue: Still seeing connection errors after updating

**Check:**
- Vercel deployment completed successfully
- Environment variable is set for the correct environment (Production/Preview)
- Backend URL is correct (no typos, includes `/api`)
- Backend is actually running and accessible

### Issue: Backend returns 404 for `/api/todos`

**Possible causes:**
- Backend routes not configured correctly
- Backend needs to be redeployed
- Different backend application (check if it's the correct backend)

### Issue: CORS errors

See `docs/VERCEL_CORS_FIX.md` for CORS troubleshooting.

