# AWS Amplify Gen 2 Setup Guide

## What's Different from Gen 1
- **Code-first approach**: Define backend in TypeScript
- **No CLI prompts**: Everything configured in code
- **Better type safety**: Full TypeScript support
- **Simpler deployment**: Single command deployment

## Setup Steps

### 1. Install Dependencies (Already Done)
```bash
cd frontend
npm install aws-amplify @aws-amplify/backend @aws-amplify/backend-cli
```

### 2. Initialize Amplify Gen 2
```bash
cd frontend
npx ampx sandbox
```

### 3. Deploy Backend
```bash
npx ampx pipeline-deploy --branch main --app-id <your-app-id>
```

## Files Created
- `amplify/backend.ts` - Backend definition
- `amplify/package.json` - Backend dependencies
- `amplify/tsconfig.json` - TypeScript config
- Updated `src/main.jsx` - Amplify configuration

## Key Commands
- `npx ampx sandbox` - Start local development
- `npx ampx generate outputs` - Generate config file
- `npx ampx pipeline-deploy` - Deploy to AWS

## Next Steps
1. Run `npx ampx sandbox` to start development
2. Add backend resources to `amplify/backend.ts`
3. Deploy with `npx ampx pipeline-deploy`

## Coexistence with Gen 1
Gen 2 projects are completely separate from Gen 1. You can have both types of projects in different directories without conflicts.