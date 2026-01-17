# Matrimony App

A full-stack matrimony application built with React Native (Expo) and Firebase.

## Project Structure

```
matrimony-app/
├── app/                    # React Native Expo application
│   ├── App.tsx            # Main app entry point
│   ├── app.json           # Expo configuration
│   └── package.json       # App dependencies
│
└── backend/               # Firebase backend
    ├── firebase.json      # Firebase configuration
    ├── firestore.rules    # Firestore security rules
    ├── firestore.indexes.json  # Firestore indexes
    ├── storage.rules      # Storage security rules
    └── functions/         # Cloud Functions (TypeScript)
        ├── src/
        │   ├── index.ts   # Functions entry point
        │   ├── users.ts   # User-related functions
        │   ├── profiles.ts # Profile functions
        │   └── interests.ts # Interest/matching functions
        └── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase CLI (`npm install -g firebase-tools`)

### Setup

#### 1. Firebase Project Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable the following services:
   - Authentication (Email/Password, Google, Phone)
   - Cloud Firestore
   - Cloud Storage
   - Cloud Functions (requires Blaze plan)

3. Update `.firebaserc` with your project ID:

   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

4. Install dependencies and deploy:
   ```bash
   cd backend/functions
   npm install
   npm run build
   cd ..
   firebase deploy
   ```

#### 2. React Native App Setup

1. Install dependencies:

   ```bash
   cd app
   npm install
   ```

2. Configure Firebase in the app (you'll need to add firebase config later)

3. Start the development server:
   ```bash
   npm start
   ```

### Development

#### Running the App

```bash
cd app
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
```

#### Running Firebase Emulators

```bash
cd backend
firebase emulators:start
```

#### Deploying Cloud Functions

```bash
cd backend
firebase deploy --only functions
```

## Firebase Services

### Authentication

- Email/Password authentication
- Phone number authentication (for OTP)
- Google Sign-In

### Firestore Collections

- `users` - User accounts and preferences
- `profiles` - Matrimony profiles (public info)
- `interests` - Interest requests between users
- `matches` - Confirmed matches
- `messages` - Chat messages
- `notifications` - User notifications

### Cloud Functions

- `onUserCreated` - Creates user document when new auth user is created
- `onUserDeleted` - Cleans up user data when account is deleted
- `onProfileWrite` - Updates profile completeness status
- `onInterestCreated` - Sends notification for new interests
- `onInterestUpdated` - Creates matches and sends notifications
- `searchProfiles` - Callable function for profile search
- `sendInterest` - Callable function to send interest requests
