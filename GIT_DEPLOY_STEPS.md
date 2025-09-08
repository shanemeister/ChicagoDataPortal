# Deploy with Git (Recommended)

## Setup Steps

### 1. Commit Your Changes
```bash
git add .
git commit -m "Add Amplify Gen 2 configuration"
git push origin main
```

### 2. Connect to Amplify Console
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Choose "GitHub" as source
4. Connect your GitHub account
5. Select repository: `shanemeister/ChicagoDataPortal`
6. Select branch: `main`

### 3. Configure Build Settings
- Amplify will auto-detect the `amplify.yml` file
- Build command: `npm run build` (in frontend directory)
- Build output directory: `frontend/dist`

### 4. Environment Variables
Set in Amplify Console:
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key

### 5. Deploy
- Amplify will automatically build and deploy on every push to main
- Get your live URL from the Amplify Console

## Benefits of Git Deployment
- ✅ Automatic deployments on push
- ✅ Branch-based environments
- ✅ Build history and rollbacks
- ✅ Pull request previews
- ✅ Better CI/CD integration

## Your Repository
- GitHub: `git@github.com:shanemeister/ChicagoDataPortal.git`
- Branch: `main`
- Ready for Amplify connection!