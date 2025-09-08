# AWS Amplify Setup Guide

## Prerequisites
1. Install AWS CLI: `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && sudo ./aws/install`
2. Configure AWS credentials: `aws configure`
3. Install Amplify CLI: `npm install -g @aws-amplify/cli`

## Setup Steps

### 1. Initialize Amplify (from frontend directory)
```bash
cd frontend
amplify init
```

### 2. Deploy to Amplify Console
1. Go to AWS Amplify Console
2. Choose "Deploy without Git provider" or connect your Git repository
3. Upload the `frontend` folder as a zip file
4. Set build settings to use the `amplify.yml` file

### 3. Configure Environment Variables
In Amplify Console → App Settings → Environment Variables:
- Key: `VITE_GOOGLE_MAPS_API_KEY`
- Value: Your Google Maps API key

### 4. Build Settings
The `amplify.yml` file is already configured for Vite builds.

### 5. Domain Setup
Configure your custom domain in Amplify Console → Domain Management.

## Files Added
- `amplify.yml` - Build configuration
- `public/_redirects` - SPA routing redirects
- `.env` - Environment variables template
- Updated `vite.config.js` - Optimized for Amplify

## Notes
- The `_redirects` file ensures React Router works properly
- Environment variables must be set in Amplify Console
- Build output goes to `dist/` directory