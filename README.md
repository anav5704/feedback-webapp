# Firebase Feedback Application

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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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