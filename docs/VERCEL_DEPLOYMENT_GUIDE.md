# CheckShip - Vercel Deployment Guide

## ✅ Prerequisites Completed

All preparation tasks have been completed:
- ✅ Builds tested successfully for both admin and mobile
- ✅ TypeScript errors fixed (removed unused imports)
- ✅ `vercel.json` files created for SPA routing
- ✅ CORS already configured in Edge Functions (`Access-Control-Allow-Origin: *`)
- ✅ Authentication flows verified

---

## 📋 Required Environment Variables

### For Both Projects (Admin & Mobile)

You'll need these from your Supabase Dashboard:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your CheckShip project
3. Settings → API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## 🚀 Deployment Steps

### Part 1: Deploy Admin Platform

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "Add New" → "Project"
   - Import your CheckShip repository

3. **Configure Admin Platform**
   ```
   Project Name: checkship-admin (or your choice)
   Framework Preset: Vite
   Root Directory: ./ (leave as root)
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     - `VITE_SUPABASE_URL` = (your Supabase URL)
     - `VITE_SUPABASE_ANON_KEY` = (your anon key)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Note your deployment URL (e.g., `checkship-admin.vercel.app`)

---

### Part 2: Deploy Mobile Client

1. **Create Second Project**
   - Click "Add New" → "Project"
   - Import the SAME CheckShip repository again

2. **Configure Mobile Client**
   ```
   Project Name: checkship-mobile (or your choice)
   Framework Preset: Vite
   Root Directory: mobile-client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**
   - Add the SAME variables:
     - `VITE_SUPABASE_URL` = (your Supabase URL)
     - `VITE_SUPABASE_ANON_KEY` = (your anon key)

4. **Deploy**
   - Click "Deploy"
   - Wait for build (~1-2 minutes)
   - Note your deployment URL (e.g., `checkship-mobile.vercel.app`)

---

## ✅ Post-Deployment Testing

### Admin Platform Tests

Access your admin URL and test:

- [ ] **Login**: `admin@checkship.com` (or your admin email)
- [ ] **Dashboard**: Should see dashboard after login
- [ ] **Users**: Can view user list
- [ ] **Create User**: Test user creation (calls Edge Function)
- [ ] **Templates**: Can view and edit checklist templates
- [ ] **Vehicles**: Can manage vehicles

### Mobile Client Tests

Access your mobile URL and test:

- [ ] **Login**: Test with a driver/operator account
- [ ] **Vehicle Selection**: Can select assigned vehicles
- [ ] **Template Selection**: Can see available checklists
- [ ] **Inspection**: Can fill out form with all field types:
  - Avaliativo (Conforme/Não Conforme)
  - Texto
  - Numérico
  - Data
  - Cadastro (CPF, etc.)
  - Lista de Seleção (single)
  - Lista de Seleção (multiple - checkboxes)
  - Photo/Attachment upload
- [ ] **Submit**: "Finalizar Inspeção" saves to database
- [ ] **Verify**: Check Supabase → `checklist_inspections` table for saved data

---

## 🔧 Troubleshooting

### Build Fails

**Error:** `TypeScript errors`
- Check deployment logs
- Likely unused imports or type errors
- Fix locally, commit, push (auto-redeploys)

### 404 on Page Refresh

**Problem:** SPA routing broken
- Ensure `vercel.json` exists in project root
- Should contain:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### Environment Variables Not Working

**Problem:** Variables return `undefined`
- Variables must start with `VITE_` prefix
- Redeploy after adding variables (Settings → Redeploy)
- Check deployment logs for undefined values

### CORS Errors on Edge Functions

**Status:** ✅ Already configured
- Edge Functions already have `Access-Control-Allow-Origin: *`
- Should work with any Vercel domain
- If issues persist, check Supabase logs

### RLS Policy Errors

**Problem:** "insufficient privileges" or "policy violations"
- Ensure user is logged in
- Check if RLS policies are active (already fixed)
- Verify user has correct role (`GESTOR` for admin)

---

## 📝 Notes

- Both apps use the SAME Supabase database
- Vercel provides preview deployments for each commit
- Production URL won't change unless you rename the project
- Automatic deployments on `git push`

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ Admin platform accessible at `your-app-admin.vercel.app`
✅ Mobile client accessible at `your-app-mobile.vercel.app`
✅ Login works on both platforms
✅ Users can create inspections on mobile
✅ Admins can manage users and templates
✅ Data persists to Supabase database
✅ No CORS errors in browser console

---

## 🚀 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Vercel → Project → Settings → Domains
   - Add custom domain (e.g., `admin.checkship.com`)

2. **Security**
   - Change default admin password
   - Review RLS policies for production
   - Consider limiting CORS to specific domains

3. **Monitoring**
   - Enable Vercel Analytics
   - Monitor Supabase logs
   - Set up error tracking (Sentry, etc.)
