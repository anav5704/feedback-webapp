# Feedback Application 📘

![Hero Image](/.github/docs/feedback-webapp.png)

A simple, single-page application built with React, Firebase, and Zod for form validation. The application allows users to:

1. Sign up or log in with email and password
2. Submit feedback once authenticated
3. Log out of their account

## Key Features

- Firebase Authentication (email/password)
- Firebase Firestore for data storage
- Form validation and sanitization with Zod
- Responsive design for all device sizes
- Clean and minimal UI

## Setup Instructions

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
4. Enable Authentication (Email/Password) and Firestore in your Firebase project
5. Replace the Firebase configuration in `src/firebase/config.ts` with your own Firebase project details:

```typescript
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

6. Run the application with `npm run dev`
7. Build for production with `npm run build`

## Project Structure

- `/src/components`: React components
  - `/Auth`: Authentication-related components
  - `/Feedback`: Feedback form components
- `/src/firebase`: Firebase configuration and services
- `/src/validation`: Zod validation schemas
- `/src/utils`: Utility functions

## Technologies Used

- React
- TypeScript
- Firebase (Authentication, Firestore)
- Zod
- CSS3
- Vite