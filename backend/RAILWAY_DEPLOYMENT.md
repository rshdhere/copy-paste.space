# Railway Deployment Guide

## Prerequisites
1. A Railway account (sign up at https://railway.app)
2. A MongoDB database (you can use MongoDB Atlas or Railway's MongoDB service)
3. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Connect Your Repository
1. Go to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `backend` directory as the source

### 2. Set Environment Variables
In your Railway project settings, add these environment variables:

```
MONGODB_URI=your_mongodb_connection_string
PORT=8080 (Railway will set this automatically)
```

### 3. Deploy
1. Railway will automatically detect the Node.js project
2. It will use the `railway.toml` configuration
3. The build process will:
   - Install dependencies
   - Run `npm run build` to compile TypeScript
   - Start the server with `npm start`

### 4. Get Your Domain
1. Once deployed, Railway will provide a domain like `https://your-app-name.railway.app`
2. You can also set up a custom domain in the settings

### 5. Update Frontend
Update your frontend API calls to use the new Railway domain instead of localhost.

## Health Check
The app includes a health check endpoint at `/api/v1/user/health` that Railway will use to monitor the service.

## Troubleshooting
- Check Railway logs if deployment fails
- Ensure all environment variables are set correctly
- Verify MongoDB connection string is accessible from Railway's servers 