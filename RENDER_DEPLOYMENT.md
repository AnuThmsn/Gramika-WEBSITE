# Gramika Website - Render Deployment Guide

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **MongoDB Atlas Account**: Free tier at [mongodb.com/cloud](https://www.mongodb.com/cloud/atlas)
3. **Git with branch pushed**: Your `anaswara` branch is already on GitHub at `github.com/anaswara304/Gramika-WEBSITE`

---

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Create a new cluster (free tier available)
3. Add a database user with a strong password
4. Get your connection string:
   - Click "Connect" → "Drivers"
   - Copy the connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/gramika?retryWrites=true&w=majority`)
5. **Save this string** — you'll need it for Render environment variables

---

## Step 2: Deploy Backend on Render

### Option A: Using render.yaml (Infrastructure as Code)

1. Make sure `render.yaml` is committed and pushed to your branch:
   ```bash
   git add render.yaml .env.production
   git commit -m "Add Render deployment config"
   git push origin anaswara
   ```

2. On Render Dashboard:
   - Click **New** → **Blueprint**
   - Connect your GitHub account and select `anaswara304/Gramika-WEBSITE`
   - Select the `anaswara` branch
   - Click **Deploy Blueprint**

3. Render will automatically create:
   - **gramika-server** web service
   - **gramika-frontend** static service

4. Add environment variables for the backend:
   - In Render Dashboard, go to **gramika-server** service
   - Environment tab → Add variables:
     - `MONGO_URI`: Your MongoDB connection string from Step 1
     - `JWT_SECRET`: Any random strong string (e.g., generate with `openssl rand -hex 32`)
     - `PORT`: 5000

### Option B: Manual Setup (Alternative)

If blueprint doesn't work, manually create services:

#### Backend Service:
1. Click **New** → **Web Service**
2. Connect repository: `github.com/anaswara304/Gramika-WEBSITE`
3. Branch: `anaswara`
4. Name: `gramika-server`
5. Runtime: Node
6. Build command: `npm install && npm install -g nodemon` (optional for dev)
7. Start command: `npm start`
8. Plan: Starter (free)
9. Add environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Random secure string
   - `PORT`: 5000
10. **Deploy**

Note: Save the backend URL (e.g., `https://gramika-server.onrender.com`)

#### Frontend Service:
1. Click **New** → **Static Site**
2. Connect repository: `github.com/anaswara304/Gramika-WEBSITE`
3. Branch: `anaswara`
4. Name: `gramika-frontend`
5. Build command: `npm install && npm run build`
6. Publish directory: `dist`
7. Environment variable:
   - `VITE_API_URL`: The backend URL from above (e.g., `https://gramika-server.onrender.com`)
8. **Deploy**

---

## Step 3: Verify Deployment

1. Visit your frontend URL (e.g., `https://gramika-frontend.onrender.com`)
2. Test the login/signup flow
3. Check browser DevTools (F12) → Network tab to ensure API calls go to the correct backend URL
4. If images don't load, verify MongoDB is accessible from Render (check connection string allows Render IPs)

---

## Step 4: Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB Atlas allows all IPs (0.0.0.0/0) in Network Access
- Verify connection string is correct in Render environment variables

### "API calls failing (CORS errors)"
- Check `server.js` has proper CORS configuration
- Ensure `API_BASE` in frontend matches backend URL

### "Frontend not loading assets"
- Verify `VITE_API_URL` is set correctly in Render environment
- Check that `.env.production` is being used during build

### "Database seeding"
- If you need initial data, run:
  ```bash
  npm run seed (locally, pointing to MongoDB Atlas)
  ```
  Or add as a build hook in Render

---

## Step 5: Optional - Custom Domain

In Render Dashboard → Your Service → Settings → Custom Domain:
- Add your custom domain (requires DNS configuration)

---

## Important Notes

- **Free Tier**: Render free instances spin down after 15 min of inactivity (first request takes ~30s)
- **Upgrades**: Consider upgrading to Starter tier ($7/month) for production reliability
- **Environment Variables**: Never commit `.env` files with real secrets; only `.env.example` with placeholders
- **Logs**: Monitor through Render Dashboard → Logs tab for debugging

---

## Quick Reference: Render URLs

Once deployed:
- **Backend API**: `https://gramika-server.onrender.com`
- **Frontend**: `https://gramika-frontend.onrender.com` (or custom domain)
- **MongoDB**: connection string from Atlas

---

**Need Help?** Check Render docs at [render.com/docs](https://render.com/docs)
