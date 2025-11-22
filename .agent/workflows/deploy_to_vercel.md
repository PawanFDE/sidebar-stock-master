---
description: Deploy the MERN stack application to Vercel (Frontend and Backend separately)
---

This guide explains how to deploy the Client and Server to Vercel as separate projects.

### Prerequisites
- Install Vercel CLI: `npm install -g vercel`
- Login to Vercel: `vercel login`

### 1. Deploy the Backend (Server)

1. Open a terminal in the `server` directory:
   ```bash
   cd server
   ```
2. Run the deployment command:
   ```bash
   vercel
   ```
   - Set up and deploy: `Y`
   - Scope: [Select your scope]
   - Link to existing project: `N`
   - Project name: `inventory-server` (or your choice)
   - In which directory is your code located?: `./`
   - Want to modify these settings?: `N`

3. **Important**: Set Environment Variables
   - Go to the Vercel Dashboard for your new project.
   - Go to **Settings** > **Environment Variables**.
   - Add the following variables from your local `.env` file:
     - `MONGO_URI`: Your MongoDB connection string (must be accessible from the internet, e.g., MongoDB Atlas).
     - `JWT_SECRET`: Your secret key.
   - Redeploy if necessary (usually adding env vars triggers a prompt to redeploy, or run `vercel --prod` locally).

4. **Copy the Backend URL**: Once deployed, copy the URL (e.g., `https://inventory-server.vercel.app`). You will need this for the frontend.

### 2. Deploy the Frontend (Client)

1. Open a terminal in the `client` directory:
   ```bash
   cd ../client
   ```
2. Run the deployment command:
   ```bash
   vercel
   ```
   - Set up and deploy: `Y`
   - Scope: [Select your scope]
   - Link to existing project: `N`
   - Project name: `inventory-client` (or your choice)
   - In which directory is your code located?: `./`
   - Want to modify these settings?: `N`

3. **Important**: Set Environment Variables
   - Go to the Vercel Dashboard for your frontend project.
   - Go to **Settings** > **Environment Variables**.
   - Add the following variable:
     - `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://inventory-server.vercel.app/api`). **Note:** Append `/api` if your backend routes are prefixed with it (which they are).

4. Redeploy the frontend:
   ```bash
   vercel --prod
   ```

### Troubleshooting
- **CORS Issues**: If you see CORS errors, you might need to update the `cors` configuration in `server/server.js` to allow your Vercel frontend domain.
  ```javascript
  app.use(cors({
    origin: ['https://your-frontend-domain.vercel.app', 'http://localhost:5173']
  }));
  ```
- **MongoDB Connection**: Ensure your MongoDB Atlas IP whitelist allows access from anywhere (`0.0.0.0/0`) since Vercel IP addresses are dynamic.
