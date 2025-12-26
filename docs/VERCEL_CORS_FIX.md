# Fixing CORS Error After Vercel Deployment

If your frontend deployed on Vercel shows "Cannot connect to backend server" errors, this is likely a CORS (Cross-Origin Resource Sharing) issue.

## Quick Fix

**Add your Vercel frontend URL to the backend CORS configuration on Render.com:**

1. Go to your Render.com dashboard
2. Select your backend service (`todolist-scaffold`)
3. Go to **Environment** tab
4. Add or update the `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://todolist-scaffold.vercel.app,http://localhost:5173
   ```
5. **Save** the environment variable
6. **Restart** your Render service (or wait for auto-deploy)

## Verify the Fix

After updating CORS_ORIGINS:

1. Wait for Render to restart (usually 1-2 minutes)
2. Refresh your Vercel frontend page
3. The connection error should be resolved

## Testing

You can test if CORS is working by checking the browser's Network tab:

1. Open your Vercel app: `https://todolist-scaffold.vercel.app`
2. Open browser DevTools (F12) → Network tab
3. Try to create a TODO item
4. Check the request to `https://todolist-scaffold.onrender.com/api/todos`
5. If CORS is fixed, you should see a successful response (status 200 or 201)
6. If CORS is still broken, you'll see a CORS error in the console

## Common Issues

### Issue: Still seeing CORS errors after updating

**Solutions:**
- Make sure there's **no trailing slash** in the URL: `https://todolist-scaffold.vercel.app` ✅ (not `https://todolist-scaffold.vercel.app/` ❌)
- Make sure you're using **https** (not http) for Vercel URLs
- Restart the Render service after updating environment variables
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Multiple frontend deployments

If you have multiple Vercel deployments (production, preview, etc.), add all URLs:
```
CORS_ORIGINS=https://todolist-scaffold.vercel.app,https://todolist-scaffold-git-main-yourname.vercel.app,http://localhost:5173
```

### Issue: Backend not responding

If the backend itself is not responding:

1. Check Render service status (should be "Live")
2. Check Render logs for errors
3. Verify `DATABASE_URL` is set correctly
4. Test backend directly: `curl https://todolist-scaffold.onrender.com/health`

## Environment Variable Format

The `CORS_ORIGINS` variable accepts:
- **Comma-separated string**: `https://app1.com,https://app2.com`
- **JSON array**: `["https://app1.com","https://app2.com"]`

Both formats work, but comma-separated is simpler.

