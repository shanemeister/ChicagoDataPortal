# Deploy to Amplify Hosting

## Option 1: Amplify Console (Recommended)
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Choose "Deploy without Git provider"
4. Upload your `frontend/dist` folder as a zip
5. Set app name: `chicagocrime-frontend`

## Option 2: Manual Zip Upload
```bash
cd frontend
npm run build
cd dist
zip -r ../frontend-build.zip .
```
Then upload `frontend-build.zip` to Amplify Console.

## Environment Variables to Set in Amplify Console
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key

## Your Current Status
✅ Sandbox running locally
✅ Build working 
✅ Ready to deploy

## Next: 
Go to Amplify Console and deploy your `dist` folder!