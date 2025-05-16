import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Auth
} from 'firebase/auth';
import { auth } from './config';

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<void> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const authError = error as Error;
    throw new Error(`Authentication failed: ${authError.message}`);
  }
};

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<void> => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const authError = error as Error;
    throw new Error(`Registration failed: ${authError.message}`);
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    const authError = error as Error;
    throw new Error(`Sign out failed: ${authError.message}`);
  }
};

// Function to listen to auth state changes
export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};