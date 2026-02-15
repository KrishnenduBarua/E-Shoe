# 🚀 Flick E-Commerce Deployment Guide

This guide will walk you through deploying the Flick e-commerce platform to production.

## 📋 Deployment Architecture

- **Frontend (Customer)**: Vercel
- **Admin Panel**: Vercel
- **Backend API**: Render
- **Database**: Render PostgreSQL
- **Image Storage**: Cloudinary

---

## 🔧 Prerequisites

Before starting, create accounts on these platforms:

1. **Vercel** (https://vercel.com) - For frontend deployments
2. **Render** (https://render.com) - For backend and database
3. **Cloudinary** (https://cloudinary.com) - For image storage
4. **GitHub** - Your code repository

---

## 📝 Step-by-Step Deployment

### 1️⃣ Setup Cloudinary

1. Sign up at https://cloudinary.com (free tier available)
2. Go to Dashboard
3. Note down these credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2️⃣ Setup Render Database

1. Sign up at https://render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `flick-db`
   - **Database**: `flick`
   - **User**: `flick`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for better performance)
4. Click **"Create Database"**
5. Wait for provisioning (1-2 minutes)
6. Copy the **External Database URL** (starts with `postgresql://`)

### 3️⃣ Setup Backend on Render

#### Option A: Using render.yaml (Automatic)

1. Push all code to GitHub
2. In Render, click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select the repository and branch
5. Render will detect `render.yaml` automatically
6. Configure the following environment variables in Render dashboard:
   ```
   CORS_ORIGIN=https://your-frontend.vercel.app,https://your-admin.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ADMIN_URL=https://your-admin.vercel.app
   ```
7. Click **"Apply"**

#### Option B: Manual Setup

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `flick-backend`
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Build Command**: `cd Backend && npm install`
   - **Start Command**: `cd Backend && npm start`
   - **Plan**: Free (or paid for better performance)
4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=[paste External Database URL from step 2]
   DB_TYPE=postgresql
   JWT_SECRET=[generate random 32+ character string]
   ADMIN_JWT_SECRET=[generate different random 32+ character string]
   JWT_EXPIRE=7d
   ADMIN_JWT_EXPIRE=7d
   CORS_ORIGIN=https://your-frontend.vercel.app,https://your-admin.vercel.app
   CLOUDINARY_CLOUD_NAME=[from step 1]
   CLOUDINARY_API_KEY=[from step 1]
   CLOUDINARY_API_SECRET=[from step 1]
   OTP_EXPIRE_MINUTES=5
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   FRONTEND_URL=https://your-frontend.vercel.app
   ADMIN_URL=https://your-admin.vercel.app
   ```
5. Click **"Create Web Service"**
6. Wait for deployment (3-5 minutes)

#### Initialize Database

After backend is deployed:

1. Go to your Render backend service
2. Click **"Shell"** tab
3. Run: `npm run setup:postgresql`
4. This will create all database tables and the default admin user

### 4️⃣ Deploy Frontend to Vercel

1. Sign up at https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure **Frontend**:
   - **Project Name**: `flick-frontend`
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_API_TIMEOUT=10000
   VITE_ENABLE_HTTPS=true
   VITE_CSRF_ENABLED=true
   VITE_APP_NAME=Flick
   VITE_APP_URL=https://your-frontend.vercel.app
   VITE_ENABLE_ANALYTICS=false
   ```
6. Click **"Deploy"**
7. Note your Vercel frontend URL

### 5️⃣ Deploy Admin Panel to Vercel

1. In Vercel, click **"Add New Project"** again
2. Import the same GitHub repository
3. Configure **Admin Panel**:
   - **Project Name**: `flick-admin`
   - **Framework Preset**: Vite
   - **Root Directory**: `AdminPage`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_APP_NAME=Flick Admin
   VITE_APP_URL=https://your-admin.vercel.app
   ```
5. Click **"Deploy"**
6. Note your Vercel admin URL

### 6️⃣ Update Backend CORS

Now that you have all URLs, update backend environment variables on Render:

1. Go to your Render backend service → **"Environment"**
2. Update these variables with actual URLs:
   ```
   CORS_ORIGIN=https://your-frontend.vercel.app,https://your-admin.vercel.app
   FRONTEND_URL=https://your-frontend.vercel.app
   ADMIN_URL=https://your-admin.vercel.app
   ```
3. Click **"Save Changes"** (backend will redeploy automatically)

### 7️⃣ Verification

Test your deployment:

1. **Frontend**: Visit your frontend URL and browse products
2. **Admin Panel**: Visit admin URL and login:
   - Email: `admin@flick.com`
   - Password: `admin123`
3. **Backend Health Check**: Visit `https://your-backend.onrender.com/health`

---

## 🔐 Security Checklist

After deployment:

- [ ] Change default admin password
- [ ] Generate strong JWT secrets (use: `openssl rand -base64 32`)
- [ ] Enable HTTPS on all services (automatically done by Vercel/Render)
- [ ] Review CORS origins to only include your domains
- [ ] Set secure cookie settings for production
- [ ] Enable Cloudinary security settings (delivery restrictions)
- [ ] Set up database backups on Render
- [ ] Configure rate limiting appropriately

---

## 🔄 Continuous Deployment

Once configured, future deployments are automatic:

1. **Push to GitHub** → Vercel and Render auto-deploy
2. **Frontend/Admin** redeploys on every push
3. **Backend** redeploys on every push

To disable auto-deploy:

- **Vercel**: Project Settings → Git → Disable auto-deploy
- **Render**: Service Settings → Auto-Deploy → Disable

---

## 📊 Monitoring

### Render (Backend)

- Dashboard shows logs, metrics, and health
- Free tier spins down after 15 min of inactivity (first request takes ~30s)

### Vercel (Frontend/Admin)

- Analytics available in dashboard
- Real User Monitoring (RUM) on paid plans

### Cloudinary (Images)

- Usage dashboard shows storage & bandwidth
- Free tier: 25 credits/month (plenty for small apps)

---

## 🐛 Troubleshooting

### Backend not connecting to database

- Verify `DATABASE_URL` is correct
- Check database is running on Render
- Run `npm run setup:postgresql` if tables don't exist

### CORS errors

- Update `CORS_ORIGIN` with exact URLs (no trailing slashes)
- Check frontend is using correct `VITE_API_URL`
- Clear browser cache and cookies

### Images not uploading

- Verify Cloudinary credentials
- Check Cloudinary dashboard for error logs
- Ensure file size is under 5MB limit

### Frontend build failing

- Check all environment variables are set in Vercel
- Verify `Root Directory` is set correctly
- Check build logs for specific errors

### Backend spinning down (Render free tier)

- First request after 15 min takes ~30 seconds
- Upgrade to paid plan for 24/7 uptime
- Or use a cron job to ping your backend every 10 min

---

## 📱 Custom Domain (Optional)

### Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

### Render

1. Go to Service Settings → Custom Domains
2. Add your custom domain
3. Configure DNS as instructed

---

## 💾 Backup Strategy

### Database Backups

- Render automatically backs up paid PostgreSQL instances
- Free tier: Export manually via Render dashboard
- Schedule: Navigate to database → Backups → Create

### Code Backups

- Already backed up on GitHub
- Consider enabling GitHub repository backup

---

## 📞 Support

If you encounter issues:

1. Check service logs:
   - **Render**: Service → Logs tab
   - **Vercel**: Deployment → Build Logs
2. Review this guide for common issues
3. Check provider status pages:
   - https://render.com/status
   - https://vercel.com/status
   - https://status.cloudinary.com

---

## 🎉 Congratulations!

Your Flick e-commerce platform is now live in production! 🚀

**Default Admin Credentials:**

- URL: https://your-admin.vercel.app
- Email: admin@flick.com
- Password: admin123 ⚠️ **Change this immediately!**

**Next Steps:**

1. Change admin password
2. Add products via admin panel
3. Test the complete checkout flow
4. Monitor your services
5. Consider upgrading to paid plans for better performance

---

## 📄 Environment Variables Reference

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
DB_TYPE=postgresql
JWT_SECRET=your-secret
ADMIN_JWT_SECRET=your-admin-secret
JWT_EXPIRE=7d
ADMIN_JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
CORS_ORIGIN=https://frontend.vercel.app,https://admin.vercel.app
OTP_EXPIRE_MINUTES=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=https://frontend.vercel.app
ADMIN_URL=https://admin.vercel.app
```

### Frontend (.env)

```env
VITE_API_URL=https://backend.onrender.com/api
VITE_API_TIMEOUT=10000
VITE_ENABLE_HTTPS=true
VITE_CSRF_ENABLED=true
VITE_APP_NAME=Flick
VITE_APP_URL=https://frontend.vercel.app
VITE_ENABLE_ANALYTICS=false
```

### Admin Panel (.env)

```env
VITE_API_URL=https://backend.onrender.com/api
VITE_APP_NAME=Flick Admin
VITE_APP_URL=https://admin.vercel.app
```
