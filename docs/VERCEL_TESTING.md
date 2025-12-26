# Testing Vite Build on Vercel

This guide helps you test and verify that the Vite build works correctly on Vercel.

## ✅ Local Verification (Before Deploying)

### 1. Clean Build Test
```bash
cd frontend
rm -rf dist node_modules/.vite
npm run build
```

**Expected Output:**
- ✅ Build completes successfully
- ✅ No TypeScript errors
- ✅ `dist/` directory is created with:
  - `index.html`
  - `assets/` directory with CSS and JS files

### 2. Type Checking (Separate)
```bash
npm run type-check
```

**Expected Output:**
- ✅ No TypeScript errors
- ✅ Path aliases resolve correctly

### 3. Preview Build Locally
```bash
npm run preview
```

Visit `http://localhost:4173` to verify the production build works.

## 🚀 Testing on Vercel

### Method 1: Vercel CLI (Recommended for Local Testing)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link to your project** (from frontend directory):
   ```bash
   cd frontend
   vercel link
   ```

4. **Test build locally with Vercel**:
   ```bash
   vercel build
   ```
   
   This simulates the Vercel build environment locally and will catch most issues.

5. **Deploy to preview**:
   ```bash
   vercel
   ```
   
   This creates a preview deployment without affecting production.

### Method 2: GitHub Integration (Recommended for CI/CD)

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Vercel will automatically**:
   - Detect the push
   - Run the build command: `npm run build`
   - Deploy if successful

3. **Monitor Build Logs**:
   - Go to your Vercel dashboard
   - Click on the deployment
   - View "Build Logs" tab
   - Look for:
     - ✅ "npm run build" completes
     - ✅ "vite build" succeeds
     - ❌ No TypeScript errors about path aliases

### Method 3: Manual Deploy from Vercel Dashboard

1. Go to your Vercel project dashboard
2. Click "Deployments" → "Create Deployment"
3. Select your branch
4. Click "Deploy"
5. Monitor the build logs in real-time

## 🔍 What to Check in Build Logs

### ✅ Success Indicators:
```
> todo-list-frontend@1.0.0 build
> vite build

vite v7.2.7 building client environment for production...
transforming...
✓ [number] modules transformed.
rendering chunks...
✓ built in [time]
```

### ❌ Failure Indicators to Watch For:
```
error TS2307: Cannot find module '@/lib/utils'
Error: Command "npm run build" exited with 2
```

## 🛠️ Troubleshooting

### If Build Fails on Vercel:

1. **Check Root Directory**:
   - Vercel Settings → General → Root Directory
   - Should be set to: `frontend`

2. **Check Framework Preset**:
   - Vercel Settings → General → Framework Preset
   - Should be: `Vite`

3. **Check Build Command**:
   - Vercel Settings → Build & Development Settings
   - Build Command: `npm run build` (should NOT include `tsc`)
   - Output Directory: `dist`

4. **Check Environment Variables**:
   - Vercel Settings → Environment Variables
   - Add any required variables (e.g., `VITE_API_URL`)

5. **Clear Build Cache**:
   - Vercel Dashboard → Your Project → Settings → General
   - Scroll to "Clear Build Cache" and click "Clear"

### Verify Configuration Files:

1. **`frontend/package.json`**:
   ```json
   {
     "scripts": {
       "build": "vite build",  // ✅ Should NOT include 'tsc'
       "type-check": "tsc --noEmit"  // ✅ Separate script
     }
   }
   ```

2. **`frontend/vite.config.ts`**:
   ```typescript
   plugins: [
     react(),
     tailwindcss(),
     tsconfigPaths(),  // ✅ Should be present
   ],
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),  // ✅ Should be present
     },
   }
   ```

3. **`frontend/vercel.json`**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

## 📊 Build Performance

Expected build times:
- Local: ~1-2 seconds
- Vercel: ~30-60 seconds (first build), ~20-40 seconds (cached builds)

## 🎯 Quick Test Checklist

Before deploying, verify:
- [ ] `npm run build` works locally
- [ ] `npm run type-check` passes locally
- [ ] `npm run preview` shows the app correctly
- [ ] `vercel build` (if using CLI) succeeds
- [ ] Root directory is set to `frontend` in Vercel
- [ ] Framework preset is `Vite` in Vercel
- [ ] Build command is `npm run build` (not `tsc && vite build`)

## 🔗 Useful Commands

```bash
# Local build
cd frontend && npm run build

# Type check
cd frontend && npm run type-check

# Preview production build
cd frontend && npm run preview

# Vercel CLI build test
cd frontend && vercel build

# Vercel CLI preview deploy
cd frontend && vercel

# Check Vercel project settings
vercel inspect
```

